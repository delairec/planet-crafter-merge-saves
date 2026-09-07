import {afterEach, describe, expect, it} from 'bun:test';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import * as bunPlatform from './platform.bun.js';
import * as nodePlatform from './platform.node.js';

/**
 * @typedef {object} FileAccessAdapter
 * @property {string} platformName
 * @property {(filePath: string) => Promise<string>} readTextFile
 * @property {(filePath: string, content: string) => Promise<void>} writeTextFile
 */

/**
 * `readTextFile` and `writeTextFile` are the substitutable part of the runtime platform: the `node:*`
 * commands only behave like their Bun counterparts as long as both adapters honour the same contract.
 * The cases below therefore run against every adapter, and assert against the filesystem rather than
 * against the sibling function, so that a divergence symmetrical to the adapter cannot hide.
 *
 * @type {FileAccessAdapter[]}
 */
const FILE_ACCESS_ADAPTERS = [
  {platformName: 'bun', readTextFile: bunPlatform.readTextFile, writeTextFile: bunPlatform.writeTextFile},
  {platformName: 'node', readTextFile: nodePlatform.readTextFile, writeTextFile: nodePlatform.writeTextFile}
];

describe.each(FILE_ACCESS_ADAPTERS)('Platform file access — $platformName adapter', ({platformName, readTextFile, writeTextFile}) => {
  /** @type {string[]} */
  const temporaryDirectories = [];

  afterEach(async () => {
    await Promise.all(temporaryDirectories.splice(0).map(directory => fs.rm(directory, {recursive: true, force: true})));
  });

  async function createTemporaryDirectory() {
    const directory = await fs.mkdtemp(path.join(os.tmpdir(), `platform-${platformName}-`));
    temporaryDirectories.push(directory);
    return directory;
  }

  describe('When the destination folder does not exist yet', () => {
    it('should create it and write the file', async () => {
      // Arrange
      const directory = await createTemporaryDirectory();
      const filePath = path.join(directory, 'merged', 'save.json');

      // Act
      await writeTextFile(filePath, 'merged content');

      // Assert
      expect(await fs.readFile(filePath, 'utf8')).toBe('merged content');
    });
  });

  describe('When the file exists', () => {
    it('should return its content', async () => {
      // Arrange
      const directory = await createTemporaryDirectory();
      const filePath = path.join(directory, 'save.json');
      await fs.writeFile(filePath, 'save content', 'utf8');

      // Act
      const result = await readTextFile(filePath);

      // Assert
      expect(result).toBe('save content');
    });
  });
});
