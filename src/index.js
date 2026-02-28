import {readdir, readFile, writeFile, mkdir} from 'node:fs/promises';
import {join, basename} from 'node:path';
import {mergeSaves, determineSaveOrder} from './merge.js';
import {resolveIdConflicts} from './utils/resolveIdConflicts.js';

const INPUT_DIR = 'input';
const OUTPUT_DIR = 'output';

async function main() {
  const inputFolders = await readdir(INPUT_DIR);
  const validSaveFolders = await filterByValidSaveFolders(inputFolders);

  console.log(`Found ${validSaveFolders.length} folder(s) to process:`);

  for (const folder of validSaveFolders) {
    await processFolder(folder);
  }

  console.log('\nDone!\n');
}

async function filterByValidSaveFolders(folders) {
  const results = [];
  for (const folder of folders) {
    const files = await readdir(join(INPUT_DIR, folder));
    if (isValidSaveFolderContent(files)) {
      results.push(folder);
    }
  }
  return results;
}

function isValidSaveFolderContent(files){
  return files.filter(isJson).length >= 2
}

function isJson(files){
  return files.endsWith('.json')
}

async function processFolder(folder) {
  console.log(`\nProcessing "${folder}"...`);
  const folderPath = join(INPUT_DIR, folder);
  const files = (await readdir(folderPath)).filter(isJson).sort();

  const [rawSaveA, rawSaveB] = await Promise.all([
    readFile(join(folderPath, files[0]), 'utf-8'),
    readFile(join(folderPath, files[1]), 'utf-8'),
  ]);

  const [saveA, saveB] = determineSaveOrder(rawSaveA, rawSaveB);
  const [fileA, fileB] = saveA === rawSaveA ? [files[0], files[1]] : [files[1], files[0]];
  console.log(`  Merging ${fileB} (save B) into ${fileA} (save A)...`);

  const saveDisplayName = folder;
  const merged = mergeSaves(saveA, saveB, saveDisplayName);
  console.log(`  ✓ Sections merged`);

  console.log(`  Resolving id conflicts...`);
  const resolved = resolveIdConflicts(merged);
  console.log(`  ✓ Id conflicts resolved`);

  await writeOutput(folder, fileA, fileB, resolved);
}

async function writeOutput(folder, fileA, fileB, content) {
  await mkdir(join(OUTPUT_DIR, folder), {recursive: true});
  const outputFileName = buildOutputFileName(fileA, fileB);
  const outputPath = join(OUTPUT_DIR, folder, outputFileName);
  await writeFile(outputPath, content, 'utf-8');
  console.log(`  ✓ Written to ${outputPath}`);
}

function buildOutputFileName(fileA, fileB) {
  const nameA = basename(fileA, '.json');
  const nameB = basename(fileB, '.json');
  return `${nameA}-${nameB}-merged.json`;
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});

