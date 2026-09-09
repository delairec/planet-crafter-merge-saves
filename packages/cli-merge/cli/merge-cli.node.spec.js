import {afterEach, beforeEach, describe, expect, it} from 'bun:test';
import {mkdir, mkdtemp, readFile, rm, writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createFakeSaveContent, createLegacyFakeSaveContent} from 'shared-save-processing/testing/createFakeSaveContent.js';
import {createGlobalMetadata} from 'shared-save-processing/testing/createSaveRecords.js';

const REPOSITORY_ROOT = fileURLToPath(new URL('../../..', import.meta.url));
const NODE_LOADER_PATH = join(REPOSITORY_ROOT, 'scripts/node/register.js');
const MERGE_CLI_PATH = join(REPOSITORY_ROOT, 'packages/cli-merge/cli/merge-cli.js');

const SAVE_FOLDER_NAME = 'Alpha';
const SAVE_A_FILE_NAME = 'Standard-1.json';
const SAVE_B_FILE_NAME = 'Standard-2.json';
const MERGED_SAVE_FILE_NAME = 'Standard-1-Standard-2-merged.json';
const GROUP_UNLOCKED_BY_SAVE_A_ONLY = 'UnlockedFromSaveA';
const GROUP_UNLOCKED_BY_SAVE_B_ONLY = 'UnlockedFromSaveB';
const BYTE_ORDER_MARK = '﻿';
const NO_PREFIX = '';

/**
 * Each save unlocks one group no other save unlocks, so the merged file names the saves that
 * actually reached the merge engine.
 * @param {string} unlockedGroup
 * @returns {string}
 */
function createSaveUnlockingOnly(unlockedGroup) {
  return createFakeSaveContent({globalMetadata: createGlobalMetadata({unlockedGroups: unlockedGroup})});
}

/**
 * @param {string} unlockedGroup
 * @returns {string}
 */
function createLegacySaveUnlockingOnly(unlockedGroup) {
  return createLegacyFakeSaveContent({globalMetadata: createGlobalMetadata({unlockedGroups: unlockedGroup})});
}

/**
 * @param {string} inputDirectory
 * @param {string} outputDirectory
 * @returns {Promise<{exitCode: number, stdout: string, stderr: string}>}
 */
async function runMergeCliUnderNode(inputDirectory, outputDirectory) {
  const cliProcess = Bun.spawn({
    cmd: ['node', '--import', NODE_LOADER_PATH, MERGE_CLI_PATH, '--platform=node', `--input=${inputDirectory}`, `--output=${outputDirectory}`],
    cwd: REPOSITORY_ROOT,
    stdout: 'pipe',
    stderr: 'pipe'
  });
  const [stdout, stderr, exitCode] = await Promise.all([
    new Response(cliProcess.stdout).text(),
    new Response(cliProcess.stderr).text(),
    cliProcess.exited
  ]);

  return {exitCode, stdout, stderr};
}

/**
 * @param {string} mergedSavePath
 * @returns {Promise<string>}
 */
async function readUnlockedGroupsOfMergedSave(mergedSavePath) {
  const mergedContent = await readFile(mergedSavePath, 'utf8');
  const [globalMetadataSection] = mergedContent.split('\n@\n');

  return JSON.parse(globalMetadataSection).unlockedGroups;
}

describe('Merge CLI run as a Node process', () => {
  let temporaryDirectory;
  let inputDirectory;
  let outputDirectory;
  let mergedSavePath;

  async function writeInputSaves(saveAContent, saveBPrefix) {
    const saveFolderPath = join(inputDirectory, SAVE_FOLDER_NAME);
    await mkdir(saveFolderPath, {recursive: true});
    await writeFile(join(saveFolderPath, SAVE_A_FILE_NAME), saveAContent, 'utf8');
    await writeFile(join(saveFolderPath, SAVE_B_FILE_NAME), saveBPrefix + createSaveUnlockingOnly(GROUP_UNLOCKED_BY_SAVE_B_ONLY), 'utf8');
  }

  beforeEach(async () => {
    temporaryDirectory = await mkdtemp(join(tmpdir(), 'merge-cli-node-'));
    inputDirectory = join(temporaryDirectory, 'in');
    outputDirectory = join(temporaryDirectory, 'out');
    mergedSavePath = join(outputDirectory, SAVE_FOLDER_NAME, MERGED_SAVE_FILE_NAME);
  });

  afterEach(async () => {
    await rm(temporaryDirectory, {recursive: true, force: true});
  });

  describe('When an input folder holds two saves', () => {
    beforeEach(async () => {
      await writeInputSaves(createSaveUnlockingOnly(GROUP_UNLOCKED_BY_SAVE_A_ONLY), NO_PREFIX);
      await mkdir(outputDirectory, {recursive: true});
    });

    it('should announce the merged save it wrote', async () => {
      // Act
      const {exitCode, stdout} = await runMergeCliUnderNode(inputDirectory, outputDirectory);

      // Assert
      expect(stdout).toBe(`${mergedSavePath}\n`);
      expect(exitCode).toBe(0);
    });

    it('should carry the contribution of both saves into the merged file', async () => {
      // Act
      await runMergeCliUnderNode(inputDirectory, outputDirectory);

      // Assert
      expect(await readUnlockedGroupsOfMergedSave(mergedSavePath))
        .toBe(`${GROUP_UNLOCKED_BY_SAVE_A_ONLY},${GROUP_UNLOCKED_BY_SAVE_B_ONLY}`);
    });
  });

  describe('When the output directory does not exist yet', () => {
    it('should create it and write the merged save in it', async () => {
      // Arrange
      await writeInputSaves(createSaveUnlockingOnly(GROUP_UNLOCKED_BY_SAVE_A_ONLY), NO_PREFIX);

      // Act
      const {exitCode} = await runMergeCliUnderNode(inputDirectory, outputDirectory);

      // Assert
      expect(await readUnlockedGroupsOfMergedSave(mergedSavePath))
        .toBe(`${GROUP_UNLOCKED_BY_SAVE_A_ONLY},${GROUP_UNLOCKED_BY_SAVE_B_ONLY}`);
      expect(exitCode).toBe(0);
    });
  });

  describe('When an input folder holds a save in the legacy format', () => {
    it('should warn about the format adaptation without failing', async () => {
      // Arrange
      await writeInputSaves(createLegacySaveUnlockingOnly(GROUP_UNLOCKED_BY_SAVE_A_ONLY), NO_PREFIX);

      // Act
      const {exitCode, stderr} = await runMergeCliUnderNode(inputDirectory, outputDirectory);

      // Assert
      expect(stderr).toContain(`⚠ Folder "${SAVE_FOLDER_NAME}" contains a save adapted from an older format:`);
      expect(stderr).toContain('  [save A] This save was created by an older version of the game and has been adapted to the current format. The obsolete Terrain Layers section was ignored.');
      expect(exitCode).toBe(0);
    });
  });

  describe('When an input save is prefixed with a byte order mark', () => {
    it('should carry the contribution of that save into the merged file', async () => {
      // Arrange
      await writeInputSaves(createSaveUnlockingOnly(GROUP_UNLOCKED_BY_SAVE_A_ONLY), BYTE_ORDER_MARK);

      // Act
      const {exitCode} = await runMergeCliUnderNode(inputDirectory, outputDirectory);

      // Assert
      expect(await readUnlockedGroupsOfMergedSave(mergedSavePath))
        .toBe(`${GROUP_UNLOCKED_BY_SAVE_A_ONLY},${GROUP_UNLOCKED_BY_SAVE_B_ONLY}`);
      expect(exitCode).toBe(0);
    });
  });
});
