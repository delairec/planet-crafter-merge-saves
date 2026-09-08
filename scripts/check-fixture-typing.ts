import {Glob} from 'bun';

const SPEC_FILES_PATTERN = '**/*.spec.{js,ts,tsx}';
const GENERATED_DIRECTORY = /(?:^|\/)(?:node_modules|dist|build|coverage)\//;
const STRING_LITERAL = /'(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*"|`(?:\\.|[^`\\])*`/g;

const TYPE_ASSERTED_AWAY = /\bas\s+(?:unknown|never)\b/;
const ANY_ANNOTATION = /:\s*any\b/;
const JSDOC_ANY = /@(?:type|param|returns|template|typedef)\s*\{[^}]*\bany\b/;
const TS_IGNORE_DIRECTIVE = /@ts-ignore\b/;
const TS_EXPECT_ERROR_DIRECTIVE = /@ts-expect-error\b/;
const JUSTIFIED_TS_EXPECT_ERROR_DIRECTIVE = /@ts-expect-error\s+\S/;

const PARTIAL_FIXTURE_REASON = 'a test fixture is fully typed: build it with its builder rather than assert the type away';
const TS_IGNORE_REASON = 'an illegal input is declared with @ts-expect-error, which fails when the error disappears';
const UNJUSTIFIED_DIRECTIVE_REASON = 'a @ts-expect-error directive says which invalidity is under test';

export interface FixtureTypingViolation {
  line: number;
  text: string;
  reason: string;
}

/**
 * Replaces the content of every string literal with filler of the same length, so that a
 * forbidden form quoted in a message or in a fixture of this very check is not read as code.
 * @param {string} line
 */
function maskStringLiterals(line: string): string {
  return line.replace(STRING_LITERAL, literal => '_'.repeat(literal.length));
}

/**
 * @param {string} maskedLine a line whose string literals have been masked
 * @returns what the rule asks for on that line, or null when the line respects it
 */
function findViolationReason(maskedLine: string): string | null {
  if (TS_IGNORE_DIRECTIVE.test(maskedLine)) {
    return TS_IGNORE_REASON;
  }
  if (TS_EXPECT_ERROR_DIRECTIVE.test(maskedLine) && !JUSTIFIED_TS_EXPECT_ERROR_DIRECTIVE.test(maskedLine)) {
    return UNJUSTIFIED_DIRECTIVE_REASON;
  }
  if (TYPE_ASSERTED_AWAY.test(maskedLine) || ANY_ANNOTATION.test(maskedLine) || JSDOC_ANY.test(maskedLine)) {
    return PARTIAL_FIXTURE_REASON;
  }
  return null;
}

/**
 * @param {string} source the whole content of a spec file
 * @returns every line making a fixture compile instead of typing it, in file order
 */
export function findFixtureTypingViolations(source: string): FixtureTypingViolation[] {
  return source.split('\n')
    .map((text, lineIndex) => ({line: lineIndex + 1, text: text.trim(), reason: findViolationReason(maskStringLiterals(text))}))
    .filter((violation): violation is FixtureTypingViolation => violation.reason !== null);
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
    findFixtureTypingViolations(source)
      .forEach(({line, text, reason}) => violations.push(`${filePath}:${line}: ${text}\n  ${reason}`));
  }
  if (violations.length === 0) {
    console.log('check:fixtures: no untyped test fixture found.');
    return 0;
  }
  violations.forEach(violation => console.log(violation));
  console.log(`check:fixtures: ${violations.length} untyped test fixture(s).`);
  return 1;
}

if (import.meta.main) {
  process.exit(await checkSpecFiles());
}
