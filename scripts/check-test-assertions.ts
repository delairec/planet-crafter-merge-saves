import {Glob} from 'bun';

const SPEC_FILES_PATTERN = 'packages/**/*.spec.{js,ts,tsx}';

const EXPECT_CALL = 'expect(';
const STRING_LITERAL = /'(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*"|`(?:\\.|[^`\\])*`/g;
const BOOLEAN_MATCHER = /^\.(?:not\.)?(?:toBeTruthy\(\)|toBeFalsy\(\)|toBe\((?:true|false)\))/;
const BOOLEAN_PRODUCING_CALL = /\.(?:some|every|includes)\(/;
const MEMBERSHIP_OR_TYPE_OPERATOR = /\b(?:in|typeof)\s/;
const COMPARISON_OPERATOR = /===|!==|==|!=|>=|<=|>|</;
const ARROW = /=>/g;

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
 * @param {string} argument the masked text passed to `expect(...)`
 */
function isFabricatedBoolean(argument: string): boolean {
  const trimmedArgument = argument.trim();
  return trimmedArgument.startsWith('!')
    || BOOLEAN_PRODUCING_CALL.test(trimmedArgument)
    || MEMBERSHIP_OR_TYPE_OPERATOR.test(trimmedArgument)
    || COMPARISON_OPERATOR.test(trimmedArgument.replace(ARROW, ''));
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

async function checkSpecFiles(): Promise<number> {
  const violations: string[] = [];
  for await (const filePath of new Glob(SPEC_FILES_PATTERN).scan({cwd: process.cwd()})) {
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
