import {afterEach, beforeEach, describe, expect, it} from 'bun:test';
import {mkdtemp, rm, writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createLegacyFakeSaveContent} from 'shared-save-processing/testing/createFakeSaveContent.js';
import {VALID_SAVE_CONTENT} from '../testing/fakeValidSaveContent.js';
import {SAVE_CONTENT_WITH_INVALID_ENTRY} from '../testing/fakeSaveContentWithInvalidEntry.js';

const REPOSITORY_ROOT = fileURLToPath(new URL('../../..', import.meta.url));
const NODE_LOADER_PATH = join(REPOSITORY_ROOT, 'scripts/node/register.js');
const VALIDATE_CLI_PATH = join(REPOSITORY_ROOT, 'packages/cli-validate/cli/validate-cli.js');
const SAVE_FILE_NAME = 'Standard-1.json';

/**
 * @param {string} saveFilePath
 * @returns {Promise<{exitCode: number, stdout: string, stderr: string}>}
 */
async function runValidateCliUnderNode(saveFilePath) {
  const cliProcess = Bun.spawn({
    cmd: ['node', '--import', NODE_LOADER_PATH, VALIDATE_CLI_PATH, '--platform=node', `--file=${saveFilePath}`],
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

describe('Validate CLI run as a Node process', () => {
  let temporaryDirectory;
  let saveFilePath;

  beforeEach(async () => {
    temporaryDirectory = await mkdtemp(join(tmpdir(), 'validate-cli-node-'));
    saveFilePath = join(temporaryDirectory, SAVE_FILE_NAME);
  });

  afterEach(async () => {
    await rm(temporaryDirectory, {recursive: true, force: true});
  });

  describe('When the save file is valid', () => {
    it('should report the file as valid', async () => {
      // Arrange
      await writeFile(saveFilePath, VALID_SAVE_CONTENT, 'utf8');

      // Act
      const {exitCode, stdout} = await runValidateCliUnderNode(saveFilePath);

      // Assert
      expect(stdout).toBe(`✓ ${saveFilePath} is valid\n`);
      expect(exitCode).toBe(0);
    });
  });

  describe('When the save file is in the legacy format', () => {
    it('should warn about the format adaptation and still report the file as valid', async () => {
      // Arrange
      await writeFile(saveFilePath, createLegacyFakeSaveContent(), 'utf8');

      // Act
      const {exitCode, stdout, stderr} = await runValidateCliUnderNode(saveFilePath);

      // Assert
      expect(stderr).toBe('⚠ This save was created by an older version of the game and has been adapted to the current format. The obsolete Terrain Layers section was ignored.\n');
      expect(stdout).toBe(`✓ ${saveFilePath} is valid\n`);
      expect(exitCode).toBe(0);
    });
  });

  describe('When the save file holds an invalid entry', () => {
    it('should name the error with its location and fail', async () => {
      // Arrange
      await writeFile(saveFilePath, SAVE_CONTENT_WITH_INVALID_ENTRY, 'utf8');

      // Act
      const {exitCode, stderr} = await runValidateCliUnderNode(saveFilePath);

      // Assert
      expect(stderr).toBe(`✖ ${saveFilePath} has 1 error(s):\n\n  [Players (section 2), entry 1] Invalid JSON: { broken entry\n`);
      expect(exitCode).toBe(1);
    });
  });
});
