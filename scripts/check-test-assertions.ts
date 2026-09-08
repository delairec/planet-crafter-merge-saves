import {Glob} from 'bun';

const SPEC_FILES_PATTERN = '**/*.spec.{js,ts,tsx}';
const GENERATED_DIRECTORY = /(?:^|\/)(?:node_modules|dist|build|coverage)\//;

const EXPECT_CALL = 'expect(';
const STRING_LITERAL = /'(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*"|`(?:\\.|[^`\\])*`/g;
const BOOLEAN_MATCHER = /^\.(?:not\.)?(?:toBeTruthy\(\)|toBeFalsy\(\)|toBe\((?:true|false)\))/;
const BOOLEAN_PRODUCING_CALL = /\.(?:some|every|includes)\(/;
const MEMBERSHIP_OR_TYPE_OPERATOR = /\b(?:in|typeof)\s/;
const COMPARISON_OPERATOR = /===|!==|==|!=|>=|<=|>|</;
const GENERIC_TYPE_ARGUMENTS = /(?<=[\w$\]])<[^<>()]*>(?=\s*\()/g;
const ARROW = /=>/g;
const OPENING_BRACKETS = '([{';
const CLOSING_BRACKETS = ')]}';

export interface FabricatedBooleanAssertion {
  line: number;
  text: string;
}

/**
 * Replaces the content of every string literal with filler of the same length, so that
 * parentheses and operators written inside a literal are not read as code.
 * @param {string} line
 */
function maskStringLiterals(line: string): string {
  return line.replace(STRING_LITERAL, literal => '_'.repeat(literal.length));
}

/**
 * Replaces everything nested in brackets with filler of the same length, so that only the
 * operators applied to the asserted value itself remain — those of a callback body, of an
 * index or of a nested call belong to another expression.
 * @param {string} expression
 */
function maskNestedGroups(expression: string): string {
  let depth = 0;
  return Array.from(expression, character => {
    if (OPENING_BRACKETS.includes(character)) {
      depth++;
      return character;
    }
    if (CLOSING_BRACKETS.includes(character)) {
      depth = Math.max(0, depth - 1);
      return character;
    }
    return depth > 0 ? '_' : character;
  }).join('');
}

/**
 * Replaces the type arguments of a generic call with filler of the same length, so that their
 * angle brackets are not read as comparisons.
 * @param {string} expression
 */
function maskGenericTypeArguments(expression: string): string {
  return expression.replace(GENERIC_TYPE_ARGUMENTS, typeArguments => '_'.repeat(typeArguments.length));
}

/**
 * @param {string} maskedLine a line whose string literals have been masked
 * @param {number} argumentStart the index right after the opening parenthesis of `expect(`
 * @returns the index of the matching closing parenthesis, or -1 when the line is unbalanced
 */
function findArgumentEnd(maskedLine: string, argumentStart: number): number {
  let depth = 1;
  for (let index = argumentStart; index < maskedLine.length; index++) {
    if (maskedLine[index] === '(') {
      depth++;
    } else if (maskedLine[index] === ')') {
      depth--;
      if (depth === 0) {
        return index;
      }
    }
  }
  return -1;
}

/**
 * A fabricated boolean is an expression evaluated to a boolean before the matcher sees it:
 * a predicate or membership call, the `in` or `typeof` operator, a negation, or a comparison.
 * Only the outermost expression counts: a comparison nested in a callback or in a call argument
 * produces the value being asserted, it is not the asserted value itself.
 * @param {string} argument the masked text passed to `expect(...)`
 */
function isFabricatedBoolean(argument: string): boolean {
  const assertedExpression = maskGenericTypeArguments(maskNestedGroups(argument)).trim();
  return assertedExpression.startsWith('!')
    || BOOLEAN_PRODUCING_CALL.test(assertedExpression)
    || MEMBERSHIP_OR_TYPE_OPERATOR.test(assertedExpression)
    || COMPARISON_OPERATOR.test(assertedExpression.replace(ARROW, ''));
}

/**
 * @param {string} line a single line of a spec file, with its string literals masked
 */
function hasFabricatedBooleanAssertion(line: string): boolean {
  let searchFrom = line.indexOf(EXPECT_CALL);
  while (searchFrom !== -1) {
    const argumentStart = searchFrom + EXPECT_CALL.length;
    const argumentEnd = findArgumentEnd(line, argumentStart);
    if (argumentEnd === -1) {
      return false;
    }
    if (BOOLEAN_MATCHER.test(line.slice(argumentEnd + 1)) && isFabricatedBoolean(line.slice(argumentStart, argumentEnd))) {
      return true;
    }
    searchFrom = line.indexOf(EXPECT_CALL, argumentStart);
  }
  return false;
}

/**
 * @param {string} source the whole content of a spec file
 * @returns every line asserting a fabricated boolean with a boolean matcher
 */
export function findFabricatedBooleanAssertions(source: string): FabricatedBooleanAssertion[] {
  return source.split('\n')
    .map((text, lineIndex) => ({line: lineIndex + 1, text: text.trim()}))
    .filter(({text}) => hasFabricatedBooleanAssertion(maskStringLiterals(text)));
}

/**
 * @param {string} filePath a spec file path relative to the repository root
 * @returns whether that spec is one of ours, wherever it lives in the repository
 */
export function isOwnSpecFile(filePath: string): boolean {
  return !GENERATED_DIRECTORY.test(filePath);
}

async function checkSpecFiles(): Promise<number> {
  const violations: string[] = [];
  for await (const filePath of new Glob(SPEC_FILES_PATTERN).scan({cwd: process.cwd()})) {
    if (!isOwnSpecFile(filePath)) {
      continue;
    }
    const source = await Bun.file(filePath).text();
    findFabricatedBooleanAssertions(source)
      .forEach(({line, text}) => violations.push(`${filePath}:${line}: ${text}`));
  }
  if (violations.length === 0) {
    console.log('check:assertions: no fabricated boolean assertion found.');
    return 0;
  }
  violations.forEach(violation => console.log(violation));
  console.log(`check:assertions: ${violations.length} fabricated boolean assertion(s); apply the matcher to the value itself.`);
  return 1;
}

if (import.meta.main) {
  process.exit(await checkSpecFiles());
}
