import {readTextFile, exitProcess, isEntryPoint, getCliArguments} from 'util-platforms/platform.js';
import {validateMergedSave} from '../validate.js';

const USAGE_MESSAGE = `Usage: bun src/validate-cli.js <path-to-save-file>`;

const CLI = initValidateCli({readTextFile, exitProcess, isEntryPoint, getCliArguments});


if (CLI.isEntryPoint(import.meta)) {
  const outputArguments = CLI.getCliArguments().find(arg => arg.startsWith('--file='));
  const filePath = outputArguments && outputArguments.split('=')[1];

  if(filePath === undefined) {
    console.error(USAGE_MESSAGE);
    CLI.exitProcess(1);
  }

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
    const {isValid, errors, warnings} = validateMergedSave(save);

    for (const warning of warnings ?? []) {
      console.warn(`⚠ ${warning}`);
    }

    if (isValid) {
      console.log(`✓ ${filePath} is valid`);
    } else {
      console.error(`✖ ${filePath} has ${errors.length} error(s):\n`);
      for (const error of errors) {
        console.error(`  [${formatErrorLocation(error)}] ${error.message}`);
      }
      exitProcess(1);
    }
  }

  return {isEntryPoint, main, exitProcess, getCliArguments};
}

function formatErrorLocation(error) {
  if (error.section !== undefined) {
    return `section ${error.section}, entry ${error.entryIndex}`;
  }
  return error.rule ?? 'structure';
}
