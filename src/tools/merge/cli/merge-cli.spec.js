import {beforeEach, describe, expect, it, mock, spyOn} from 'bun:test';
import {initMergeCli} from './merge-cli.js';
import {FAKE_SAVE_STRING_A, FAKE_SAVE_STRING_B} from '../../../utils/testing/fixtures/merge-cli/fakeSaveStrings.js';
import {
  MERGED_SAVE_OUTPUT_PATH,
  SAVE_A_FILENAME,
  SAVE_A_INPUT_PATH,
  SAVE_B_FILENAME,
  SAVE_B_INPUT_PATH,
  INPUT_SUBFOLDER_ALPHA,
  OUTPUT_DIR
} from '../../../utils/testing/fixtures/fakePaths.js';

describe('Merge CLI', () => {
  let consoleLogSpy;
  let readDirectory;
  let readTextFile;
  let writeTextFile;
  let main;

  beforeEach(() => {
    consoleLogSpy = spyOn(console, 'log').mockImplementation(() => {});
    readDirectory = mock();
    readTextFile = mock();
    writeTextFile = mock(() => Promise.resolve());

    const fakePlatform = {
      readDirectory,
      readTextFile,
      writeTextFile,
      joinPath: (...segments) => segments.join('/'),
      getBasename: (path, ext) => ext ? path.replace(ext, '') : path,
      isEntryPoint: () => false,
      exitProcess: () => {},
    };

    ({main} = initMergeCli(fakePlatform));
  });

  describe('When no input folders contain two or more JSON files', () => {
    it('should report zero folders to process and write nothing', async () => {
      // Arrange
      readDirectory.mockResolvedValueOnce([INPUT_SUBFOLDER_ALPHA]);
      readDirectory.mockResolvedValueOnce(['only-one.json']);

      // Act
      await main();

      // Assert
      expect(writeTextFile).not.toHaveBeenCalled();
    });
  });

  describe('When an input folder contains exactly two JSON files', () => {
    it('should produce one merged output file', async () => {
      // Arrange
      readDirectory.mockResolvedValueOnce([INPUT_SUBFOLDER_ALPHA]);
      readDirectory.mockResolvedValueOnce([SAVE_A_FILENAME, SAVE_B_FILENAME]);
      readDirectory.mockResolvedValueOnce([SAVE_A_FILENAME, SAVE_B_FILENAME]);
      readTextFile.mockImplementation((path) => {
        if (path === SAVE_A_INPUT_PATH) return Promise.resolve(FAKE_SAVE_STRING_A);
        if (path === SAVE_B_INPUT_PATH) return Promise.resolve(FAKE_SAVE_STRING_B);
        return Promise.reject(new Error(`Unexpected path: ${path}`));
      });

      // Act
      await main();

      // Assert
      expect(writeTextFile).toHaveBeenCalledTimes(1);
      expect(writeTextFile.mock.calls[0][0]).toBe(MERGED_SAVE_OUTPUT_PATH);
    });

    it('should write a non-empty merged save string', async () => {
      // Arrange
      readDirectory.mockResolvedValueOnce([INPUT_SUBFOLDER_ALPHA]);
      readDirectory.mockResolvedValueOnce([SAVE_A_FILENAME, SAVE_B_FILENAME]);
      readDirectory.mockResolvedValueOnce([SAVE_A_FILENAME, SAVE_B_FILENAME]);
      readTextFile.mockImplementation((path) => {
        if (path === SAVE_A_INPUT_PATH) return Promise.resolve(FAKE_SAVE_STRING_A);
        if (path === SAVE_B_INPUT_PATH) return Promise.resolve(FAKE_SAVE_STRING_B);
        return Promise.reject(new Error(`Unexpected path: ${path}`));
      });

      // Act
      await main();

      // Assert
      const writtenContent = writeTextFile.mock.calls[0][1];
      expect(typeof writtenContent).toBe('string');
      expect(writtenContent.length).toBeGreaterThan(0);
    });
  });

  describe('When there are two valid input folders', () => {
    const FOLDER_BETA = 'Beta';
    const EXPECTED_OUTPUT_PATH_BETA = `${OUTPUT_DIR}/${FOLDER_BETA}/Standard-1-Standard-2-merged.json`;

    it('should produce one merged output file per folder', async () => {
      // Arrange
      readDirectory.mockResolvedValueOnce([INPUT_SUBFOLDER_ALPHA, FOLDER_BETA]);
      readDirectory.mockResolvedValueOnce([SAVE_A_FILENAME, SAVE_B_FILENAME]);
      readDirectory.mockResolvedValueOnce([SAVE_A_FILENAME, SAVE_B_FILENAME]);
      readDirectory.mockResolvedValueOnce([SAVE_A_FILENAME, SAVE_B_FILENAME]);
      readDirectory.mockResolvedValueOnce([SAVE_A_FILENAME, SAVE_B_FILENAME]);
      readTextFile.mockResolvedValue(FAKE_SAVE_STRING_A);

      // Act
      await main();

      // Assert
      expect(writeTextFile).toHaveBeenCalledTimes(2);
      const outputPaths = writeTextFile.mock.calls.map(call => call[0]);
      expect(outputPaths).toContain(MERGED_SAVE_OUTPUT_PATH);
      expect(outputPaths).toContain(EXPECTED_OUTPUT_PATH_BETA);
    });
  });

  describe('When a folder contains non-JSON files alongside JSON files', () => {
    it('should ignore non-JSON files when selecting saves to merge', async () => {
      // Arrange
      const filesWithNonJson = [SAVE_A_FILENAME, 'readme.txt', SAVE_B_FILENAME, 'notes.md'];
      readDirectory.mockResolvedValueOnce([INPUT_SUBFOLDER_ALPHA]);
      readDirectory.mockResolvedValueOnce(filesWithNonJson);
      readDirectory.mockResolvedValueOnce(filesWithNonJson);
      readTextFile.mockResolvedValue(FAKE_SAVE_STRING_A);

      // Act
      await main();

      // Assert
      expect(writeTextFile).toHaveBeenCalledTimes(1);
      const writtenPath = writeTextFile.mock.calls[0][0];
      expect(writtenPath).toBe(MERGED_SAVE_OUTPUT_PATH);
    });
  });
});
