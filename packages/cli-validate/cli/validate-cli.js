import {getCliArguments} from 'shared-platforms/platform.common.js';
import {extractPlatformParameter} from 'shared-platforms/extractPlatformParameter.js';
import {createPlatform} from 'shared-platforms/platform.js';
import {validateSaveContent} from 'core-mapping/infrastructure/validateSaveContent.js';

const USAGE_MESSAGE = `Usage: bun validate-cli.js --file=<path-to-save-file>`;

const {readTextFile, exitProcess, isEntryPoint} = createPlatform(extractPlatformParameter(getCliArguments()));

const CLI = initValidateCli({readTextFile, exitProcess, isEntryPoint, getCliArguments});


if (CLI.isEntryPoint(import.meta)) {
  const filePath = parseFilePathArgument(CLI.getCliArguments());

  if (filePath === undefined) {
    console.error(USAGE_MESSAGE);
    CLI.exitProcess(1);
  } else {
    CLI.main(filePath).catch(err => {
      console.error('Error:', err);
      CLI.exitProcess(1);
    });
  }
}

function parseFilePathArgument(cliArguments) {
  const fileArgument = cliArguments.find(arg => arg.startsWith('--file='));
  return fileArgument && fileArgument.split('=')[1];
}

export function initValidateCli({readTextFile, exitProcess, isEntryPoint, getCliArguments}) {
  async function main(filePath) {
    if (!filePath) {
      console.error(USAGE_MESSAGE);
      exitProcess(1);
      return;
    }

    const save = await readTextFile(filePath);
    const {isValid, errors, warnings} = validateSaveContent(save);

    for (const warning of warnings ?? []) {
      console.warn(`⚠ ${warning}`);
    }

    if (isValid) {
      console.log(`✓ ${filePath} is valid`);
      exitProcess(0);
    } else {
      console.error(`✖ ${filePath} has ${errors.length} error(s):\n`);
      for (const error of errors) {
        console.error(`  [${formatErrorLocation(error)}] ${error.detail}`);
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
  return error.code ?? 'structure';
}
