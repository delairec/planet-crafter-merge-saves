/** @import { SaveValidationErrorViewModel } from 'core-mapping/presentation/viewModels/SaveFileValidationViewModel' */

/**
 * Rendering for the merge CLI. Diagnostics go to stderr, the merge result (output file paths) goes to stdout.
 */

/** @param {number} count */
export function renderFoldersFound(count) {
  console.error(`Found ${count} folder(s) to process.`);
}

/** @param {string} folder */
export function renderProcessingFolder(folder) {
  console.error(`Processing "${folder}"...`);
}

/** @param {string} outputPath */
export function renderMergeSucceeded(outputPath) {
  console.log(outputPath);
}

/**
 * @param {string} folder
 * @param {SaveValidationErrorViewModel[]} saveAErrors
 * @param {SaveValidationErrorViewModel[]} saveBErrors
 */
export function renderMergeFailed(folder, saveAErrors, saveBErrors) {
  console.error(`✖ Folder "${folder}" contains an invalid save file:`);
  for (const error of saveAErrors) console.error(`  [save A] ${formatErrorLine(error)}`);
  for (const error of saveBErrors) console.error(`  [save B] ${formatErrorLine(error)}`);
}

/** @param {SaveValidationErrorViewModel} error */
function formatErrorLine(error) {
  if (error.location === null) {
    return error.message;
  }
  return `[${error.location}] ${error.message}`;
}

/**
 * Reports the adaptations a save needed to match the current format. Not an error: the exit code is
 * unaffected and the merge goes on.
 * @param {string} folder
 * @param {string[]} saveAWarningMessages
 * @param {string[]} saveBWarningMessages
 */
export function renderMergeWarnings(folder, saveAWarningMessages, saveBWarningMessages) {
  if (saveAWarningMessages.length === 0 && saveBWarningMessages.length === 0) {
    return;
  }

  console.error(`⚠ Folder "${folder}" contains a save adapted from an older format:`);
  for (const message of saveAWarningMessages) console.error(`  [save A] ${message}`);
  for (const message of saveBWarningMessages) console.error(`  [save B] ${message}`);
}

/** @param {string} inputDir */
export function renderNoValidFolders(inputDir) {
  console.error(`No folder in "${inputDir}" contains at least two JSON save files to merge.`);
}

export function renderDone() {
  console.error('Done.');
}

/** @param {unknown} error */
export function renderUnexpectedError(error) {
  console.error(`Error: ${error instanceof Error ? error.message : String(error)}`);
}
