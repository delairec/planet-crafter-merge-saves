import {maskStringLiterals, readOwnSpecFiles, reportViolations} from './specSources.ts';

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

async function checkSpecFiles(): Promise<number> {
  const violations: string[] = [];
  for await (const {filePath, source} of readOwnSpecFiles()) {
    findFixtureTypingViolations(source)
      .forEach(({line, text, reason}) => violations.push(`${filePath}:${line}: ${text}\n  ${reason}`));
  }
  return reportViolations(
    'check:fixtures',
    violations,
    'no untyped test fixture found.',
    count => `${count} untyped test fixture(s).`
  );
}

if (import.meta.main) {
  process.exit(await checkSpecFiles());
}
