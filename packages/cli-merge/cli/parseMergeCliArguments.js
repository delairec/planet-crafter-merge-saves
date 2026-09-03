const DEFAULT_INPUT_DIR = 'input';
const DEFAULT_OUTPUT_DIR = 'output';
const INPUT_FLAG = '--input=';
const OUTPUT_FLAG = '--output=';

/**
 * @param {string[]} argv
 * @returns {{inputDir: string, outputDir: string}}
 */
export function parseMergeCliArguments(argv) {
  const inputArg = argv.find(arg => arg.startsWith(INPUT_FLAG));
  const outputArg = argv.find(arg => arg.startsWith(OUTPUT_FLAG));

  return {
    inputDir: inputArg ? inputArg.slice(INPUT_FLAG.length) : DEFAULT_INPUT_DIR,
    outputDir: outputArg ? outputArg.slice(OUTPUT_FLAG.length) : DEFAULT_OUTPUT_DIR,
  };
}
