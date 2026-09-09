import {getCliArguments} from 'shared-platforms/platform.common.js';
import {extractPlatformParameter} from 'shared-platforms/extractPlatformParameter.js';
import {createPlatform} from 'shared-platforms/platform.js';
import {MergeSaveFilesController} from 'core-mapping/controllers/MergeSaveFilesController';
import {parseMergeCliArguments} from './parseMergeCliArguments.js';
import {
  renderDone,
  renderFoldersFound,
  renderMergeFailed,
  renderMergeSucceeded,
  renderMergeWarnings,
  renderNoValidFolders,
  renderProcessingFolder,
  renderUnexpectedError
} from './renderMergeCliOutput.js';

const NO_VALID_FOLDERS_EXIT_CODE = 2;
const UNEXPECTED_ERROR_EXIT_CODE = 1;

const argv = getCliArguments();
const {isEntryPoint, readTextFile, exitProcess, readDirectory, writeTextFile, joinPath} = createPlatform(extractPlatformParameter(argv));

const CLI = initMergeCli({isEntryPoint, readTextFile, exitProcess, readDirectory, writeTextFile, joinPath}, argv);

if (CLI.isEntryPoint(import.meta)) {
  CLI.main().catch(err => {
    renderUnexpectedError(err);
    CLI.exitProcess(UNEXPECTED_ERROR_EXIT_CODE);
  });
}

export function initMergeCli({isEntryPoint, readTextFile, exitProcess, readDirectory, writeTextFile, joinPath}, argv = []) {
  const {inputDir, outputDir} = parseMergeCliArguments(argv);

  async function filterByValidSaveFolders(folders) {
    const results = [];
    for (const folder of folders) {
      const files = await readDirectory(joinPath(inputDir, folder));
      if (isValidSaveFolderContent(files)) {
        results.push(folder);
      }
    }
    return results;
  }

  async function processFolder(folder) {
    renderProcessingFolder(folder);
    const folderPath = joinPath(inputDir, folder);
    const [fileNameA, fileNameB] = (await readDirectory(folderPath)).filter(isJson).sort();

    const viewModel = await MergeSaveFilesController.mergeSaveFiles({
      fileNameA,
      contentA: await readTextFile(joinPath(folderPath, fileNameA)),
      fileNameB,
      contentB: await readTextFile(joinPath(folderPath, fileNameB)),
      saveDisplayName: folder
    });

    renderMergeWarnings(folder, viewModel.saveAWarnings, viewModel.saveBWarnings);

    if (viewModel.status !== 'success') {
      renderMergeFailed(folder, viewModel.saveAErrors, viewModel.saveBErrors);
      return;
    }

    await writeOutput(folder, viewModel.fileName, viewModel.content);
  }

  async function writeOutput(folder, outputFileName, content) {
    const outputPath = joinPath(outputDir, folder, outputFileName);
    await writeTextFile(outputPath, content);
    renderMergeSucceeded(outputPath);
  }

  function isJson(file) {
    return file.endsWith('.json');
  }

  async function main() {
    const inputFolders = await readDirectory(inputDir);
    const validSaveFolders = await filterByValidSaveFolders(inputFolders);

    if (validSaveFolders.length === 0) {
      renderNoValidFolders(inputDir);
      exitProcess(NO_VALID_FOLDERS_EXIT_CODE);
      return;
    }

    renderFoldersFound(validSaveFolders.length);
    for (const folder of validSaveFolders) {
      await processFolder(folder);
    }
    renderDone();
    exitProcess(0);
  }

  function isValidSaveFolderContent(files) {
    return files.filter(isJson).length === 2;
  }

  return {isEntryPoint, main, exitProcess};
}
