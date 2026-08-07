import {exitProcess, isEntryPoint, joinPath, readDirectory, readTextFile, writeTextFile} from '../../util-platforms/platform.js';
import {resolveIdConflicts} from '../../util-parsing/resolveIdConflicts.js';
import {buildMergedFileName} from '../../util-parsing/buildMergedFileName.js';
import {merge} from '../merge.js';

const INPUT_DIR = 'input';
const OUTPUT_DIR = 'output';

const CLI = initMergeCli({isEntryPoint, readTextFile, exitProcess, readDirectory, writeTextFile, joinPath});
if (CLI.isEntryPoint(import.meta)) {
  CLI.main().catch(err => {
    console.error('Error:', err);
    CLI.exitProcess(1);
  });
}

export function initMergeCli({isEntryPoint, readTextFile, exitProcess, readDirectory, writeTextFile, joinPath}) {
  async function filterByValidSaveFolders(folders) {
    const results = [];
    for (const folder of folders) {
      const files = await readDirectory(joinPath(INPUT_DIR, folder));
      if (isValidSaveFolderContent(files)) {
        results.push(folder);
      }
    }
    return results;
  }

  async function processFolder(folder) {
    console.log(`\nProcessing "${folder}"...`);
    const folderPath = joinPath(INPUT_DIR, folder);
    const files = (await readDirectory(folderPath)).filter(isJson).sort();
    const saveDisplayName = folder;
    const [contentA, contentB] = await Promise.all([
      readTextFile(joinPath(folderPath, files[0])),
      readTextFile(joinPath(folderPath, files[1]))
    ]);
    const {mergeSaves, saveAWorldObjectIds, indexFileA, indexFileB} = merge(contentA, contentB, saveDisplayName);
    const fileA = files[indexFileA];
    const fileB = files[indexFileB];
    console.log(`  Merging ${fileB} (save B) into ${fileA} (save A)...`);
    const merged = mergeSaves();
    console.log(`  ✓ Sections merged`);
    console.log(`  Resolving id conflicts...`);
    const resolved = resolveIdConflicts(merged, saveAWorldObjectIds);
    console.log(`  ✓ Id conflicts resolved`);
    await writeOutput(folder, fileA, fileB, resolved);
  }

  async function writeOutput(folder, fileA, fileB, content) {
    const outputFileName = buildMergedFileName(fileA, fileB);
    const outputPath = joinPath(OUTPUT_DIR, folder, outputFileName);
    await writeTextFile(outputPath, content);
    console.log(`  ✓ Written to ${outputPath}`);
  }

  function isJson(file) {
    return file.endsWith('.json');
  }

  async function main() {
    const inputFolders = await readDirectory(INPUT_DIR);
    const validSaveFolders = await filterByValidSaveFolders(inputFolders);
    console.log(`Found ${validSaveFolders.length} folder(s) to process:`);
    for (const folder of validSaveFolders) {
      await processFolder(folder);
    }
    console.log('\nDone!\n');
  }

  function isValidSaveFolderContent(files) {
    return files.filter(isJson).length >= 2;
  }

  return {isEntryPoint, main, exitProcess};
}
