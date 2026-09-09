import {Glob} from 'bun';

const SPEC_FILES_PATTERN = '**/*.spec.{js,ts,tsx}';
const GENERATED_DIRECTORY = /(?:^|\/)(?:node_modules|dist|build|coverage)\//;
const STRING_LITERAL = /'(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*"|`(?:\\.|[^`\\])*`/g;

/**
 * Replaces the content of every string literal with filler of the same length, so that a form
 * quoted in a message, or the brackets and operators written inside a literal, are not read as code.
 * @param {string} line
 */
export function maskStringLiterals(line: string): string {
  return line.replace(STRING_LITERAL, literal => '_'.repeat(literal.length));
}

/**
 * @param {string} filePath a spec file path relative to the repository root
 * @returns whether that spec is one of ours, wherever it lives in the repository
 */
export function isOwnSpecFile(filePath: string): boolean {
  return !GENERATED_DIRECTORY.test(filePath);
}

/**
 * @returns the path and the content of every spec file of the repository, generated ones excluded
 */
export async function* readOwnSpecFiles(): AsyncGenerator<{filePath: string, source: string}> {
  for await (const filePath of new Glob(SPEC_FILES_PATTERN).scan({cwd: process.cwd()})) {
    if (!isOwnSpecFile(filePath)) {
      continue;
    }
    yield {filePath, source: await Bun.file(filePath).text()};
  }
}

/**
 * Prints what a guard found and gives the exit code it must return: the report is the whole
 * user interface of a guard, so both checks state their outcome the same way.
 * @param {string} checkName the npm script name, as the reader will type it again
 * @param {string[]} violations one entry per offending line, already formatted
 * @param {string} nothingFound the sentence printed when the repository respects the rule
 * @param {(count: number) => string} summarize the sentence printed when it does not
 */
export function reportViolations(
  checkName: string,
  violations: string[],
  nothingFound: string,
  summarize: (count: number) => string
): number {
  if (violations.length === 0) {
    console.log(`${checkName}: ${nothingFound}`);
    return 0;
  }
  violations.forEach(violation => console.log(violation));
  console.log(`${checkName}: ${summarize(violations.length)}`);
  return 1;
}
