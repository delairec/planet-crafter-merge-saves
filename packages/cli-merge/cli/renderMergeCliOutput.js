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
 * @param {string[]} saveAErrorMessages
 * @param {string[]} saveBErrorMessages
 */
export function renderMergeFailed(folder, saveAErrorMessages, saveBErrorMessages) {
  console.error(`✖ Folder "${folder}" contains an invalid save file:`);
  for (const message of saveAErrorMessages) console.error(`  [save A] ${message}`);
  for (const message of saveBErrorMessages) console.error(`  [save B] ${message}`);
}

/**
 * Reports the adaptations a save needed to match the current format. Not an error: the exit code is
 * unaffected and the merge goes on.
 * @param {string} folder
 * @param {string[]} saveAWarningMessages
 * @param {string[]} saveBWarningMessages
 */
export function renderMergeWarnings(folder, saveAWarningMessages, saveBWarningMessages) {
  for (const message of saveAWarningMessages) console.error(`⚠ Folder "${folder}" [save A] ${message}`);
  for (const message of saveBWarningMessages) console.error(`⚠ Folder "${folder}" [save B] ${message}`);
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
