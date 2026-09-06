import {afterEach, describe, expect, it} from 'bun:test';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {isEntryPoint, readTextFile, writeTextFile} from './platform.bun.js';

describe('Bun platform', () => {

  describe('writeTextFile', () => {
    /** @type {string[]} */
    const temporaryDirectories = [];

    afterEach(async () => {
      await Promise.all(temporaryDirectories.splice(0).map(directory => fs.rm(directory, {recursive: true, force: true})));
    });

    async function createTemporaryDirectory() {
      const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'platform-bun-'));
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
    describe('When importMeta.main is true', () => {
      it('should return true', () => {
        // Arrange
        const importMeta = {main: true};

        // Act
        const result = isEntryPoint(importMeta);

        // Assert
        expect(result).toBe(true);
      });
    });

    describe('When importMeta.main is false', () => {
      it('should return false', () => {
        // Arrange
        const importMeta = {main: false};

        // Act
        const result = isEntryPoint(importMeta);

        // Assert
        expect(result).toBe(false);
      });
    });

    describe('When importMeta.main is absent', () => {
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
