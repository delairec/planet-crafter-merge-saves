import {afterEach, describe, expect, it} from 'bun:test';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {isEntryPoint, readTextFile, writeTextFile} from './platform.node.js';

describe('Node platform', () => {

  describe('writeTextFile', () => {
    /** @type {string[]} */
    const temporaryDirectories = [];

    afterEach(async () => {
      await Promise.all(temporaryDirectories.splice(0).map(directory => fs.rm(directory, {recursive: true, force: true})));
    });

    async function createTemporaryDirectory() {
      const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'platform-node-'));
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
        expect(await readTextFile(filePath)).toBe('merged content');
      });
    });
  });

  describe('isEntryPoint', () => {
    describe('When the running script path matches the module URL', () => {
      it('should return true', () => {
        // Arrange
        const scriptPath = process.argv[1];
        const importMeta = {url: `file://${scriptPath}`};

        // Act
        const result = isEntryPoint(importMeta);

        // Assert
        expect(result).toBe(true);
      });
    });

    describe('When the running script path does not match the module URL', () => {
      it('should return false', () => {
        // Arrange
        const importMeta = {url: 'file:///some/other/module.js'};

        // Act
        const result = isEntryPoint(importMeta);

        // Assert
        expect(result).toBe(false);
      });
    });

    describe('When importMeta has no url', () => {
      it('should return false', () => {
        // Arrange
        const importMeta = {};

        // Act
        const result = isEntryPoint(importMeta);

        // Assert
        expect(result).toBe(false);
      });
    });
  });
});
