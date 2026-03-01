import {readTextFile, exitProcess, isEntryPoint, getCliArguments} from './platform.js';
import {validateMergedSave} from './validate/validate.js';

const USAGE_MESSAGE = 'Usage: bun src/validate-cli.js <path-to-save-file>';

const CLI = initValidateCli({readTextFile, exitProcess, isEntryPoint, getCliArguments});


if (CLI.isEntryPoint(import.meta)) {
  const [, , filePath] = CLI.getCliArguments();
  CLI.main(filePath).catch(err => {
    console.error('Error:', err);
    CLI.exitProcess(1);
  });
}

export function initValidateCli({readTextFile, exitProcess, isEntryPoint, getCliArguments}) {
  async function main(filePath) {
    if (!filePath) {
      console.error(USAGE_MESSAGE);
      exitProcess(1);
      return;
    }

    const save = await readTextFile(filePath);
    const {isValid, errors} = validateMergedSave(save);

    if (isValid) {
      console.log(`✓ ${filePath} is valid`);
    } else {
      console.error(`✖ ${filePath} has ${errors.length} error(s):\n`);
      for (const error of errors) {
        const location = [
          error.section !== undefined ? `section ${error.section}` : null,
          error.entryIndex !== undefined ? `entry ${error.entryIndex}` : null
        ].filter(Boolean).join(', ');
        console.error(`  [${location || error.rule || 'structure'}] ${error.message}`);
      }
      exitProcess(1);
    }
  }

  return {isEntryPoint, main, exitProcess, getCliArguments};
}
