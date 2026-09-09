/** @import { SaveValidationMessageViewModel } from 'core-mapping/presentation/viewModels/SaveFileValidationViewModel' */

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
 * @param {SaveValidationMessageViewModel[]} saveAErrors
 * @param {SaveValidationMessageViewModel[]} saveBErrors
 */
export function renderMergeFailed(folder, saveAErrors, saveBErrors) {
  console.error(`✖ Folder "${folder}" contains an invalid save file:`);
  for (const error of saveAErrors) console.error(`  [save A] ${formatMessageLine(error)}`);
  for (const error of saveBErrors) console.error(`  [save B] ${formatMessageLine(error)}`);
}

/** @param {SaveValidationMessageViewModel} validationMessage */
function formatMessageLine({message, location}) {
  if (location === null) {
    return message;
  }
  return `[${location}] ${message}`;
}

/**
 * Reports the adaptations a save needed to match the current format. Not an error: the exit code is
 * unaffected and the merge goes on.
 * @param {string} folder
 * @param {SaveValidationMessageViewModel[]} saveAWarnings
 * @param {SaveValidationMessageViewModel[]} saveBWarnings
 */
export function renderMergeWarnings(folder, saveAWarnings, saveBWarnings) {
  if (saveAWarnings.length === 0 && saveBWarnings.length === 0) {
    return;
  }

  console.error(`⚠ Folder "${folder}" contains a save adapted from an older format:`);
  for (const warning of saveAWarnings) console.error(`  [save A] ${formatMessageLine(warning)}`);
  for (const warning of saveBWarnings) console.error(`  [save B] ${formatMessageLine(warning)}`);
}

/**
 * Reports a folder left out of the merge because it does not hold the two save files a merge takes.
 * @param {string} folder
 * @param {number} jsonFileCount
 */
export function renderSkippedFolder(folder, jsonFileCount) {
  console.error(`⚠ Folder "${folder}" was skipped: it holds ${jsonFileCount} JSON save file(s), exactly two are required.`);
}

/** @param {string} inputDir */
export function renderNoValidFolders(inputDir) {
  console.error(`No folder in "${inputDir}" contains exactly two JSON save files to merge.`);
}

export function renderDone() {
  console.error('Done.');
}

/** @param {unknown} error */
export function renderUnexpectedError(error) {
  console.error(`Error: ${error instanceof Error ? error.message : String(error)}`);
}
