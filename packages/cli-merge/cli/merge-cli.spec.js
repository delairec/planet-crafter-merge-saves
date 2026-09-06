import {beforeEach, describe, expect, it, mock, spyOn} from 'bun:test';
import {initMergeCli} from './merge-cli.js';
import {FAKE_SAVE_STRING_A, FAKE_SAVE_STRING_B, LEGACY_FAKE_SAVE_STRING_A} from '../testing/fakeSaveStrings.js';
import {
  MERGED_SAVE_OUTPUT_PATH,
  SAVE_A_FILENAME,
  SAVE_A_INPUT_PATH,
  SAVE_B_FILENAME,
  SAVE_B_INPUT_PATH,
  INPUT_SUBFOLDER_ALPHA,
  OUTPUT_DIR
} from '../testing/fakePaths.js';

describe('Merge CLI', () => {
  let consoleLogSpy;
  let consoleErrorSpy;
  let readDirectory;
  let readTextFile;
  let writeTextFile;
  let exitProcess;
  let main;

  function initCli(argv) {
    const fakePlatform = {
      readDirectory,
      readTextFile,
      writeTextFile,
      joinPath: (...segments) => segments.join('/'),
      getBasename: (path, ext) => ext ? path.replace(ext, '') : path,
      isEntryPoint: () => false,
      exitProcess,
    };

    return initMergeCli(fakePlatform, argv);
  }

  beforeEach(() => {
    consoleLogSpy = spyOn(console, 'log').mockImplementation(() => {});
    consoleErrorSpy = spyOn(console, 'error').mockImplementation(() => {});
    readDirectory = mock();
    readTextFile = mock();
    writeTextFile = mock(() => Promise.resolve());
    exitProcess = mock();

    ({main} = initCli());
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

  describe('When the merge completes successfully', () => {
    it('should exit with code 0', async () => {
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
      expect(exitProcess).toHaveBeenCalledWith(0);
    });

    it('should print the merged output path to stdout', async () => {
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
      expect(consoleLogSpy).toHaveBeenCalledWith(MERGED_SAVE_OUTPUT_PATH);
    });
  });

  describe('When no input folders contain two or more JSON files', () => {
    it('should exit with a distinct exit code', async () => {
      // Arrange
      readDirectory.mockResolvedValueOnce([INPUT_SUBFOLDER_ALPHA]);
      readDirectory.mockResolvedValueOnce(['only-one.json']);

      // Act
      await main();

      // Assert
      expect(exitProcess).toHaveBeenCalledWith(2);
    });

    it('should report the issue on stderr rather than stdout', async () => {
      // Arrange
      readDirectory.mockResolvedValueOnce([INPUT_SUBFOLDER_ALPHA]);
      readDirectory.mockResolvedValueOnce(['only-one.json']);

      // Act
      await main();

      // Assert
      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(consoleLogSpy).not.toHaveBeenCalled();
    });
  });

  describe('When an input folder contains more than two JSON files', () => {
    const SAVE_C_FILENAME = 'Standard-3.json';

    it('should merge all files present in the folder rather than only the first two', async () => {
      // Arrange
      readDirectory.mockResolvedValueOnce([INPUT_SUBFOLDER_ALPHA]);
      readDirectory.mockResolvedValueOnce([SAVE_A_FILENAME, SAVE_B_FILENAME, SAVE_C_FILENAME]);
      readDirectory.mockResolvedValueOnce([SAVE_A_FILENAME, SAVE_B_FILENAME, SAVE_C_FILENAME]);
      readTextFile.mockResolvedValue(FAKE_SAVE_STRING_A);

      // Act
      await main();

      // Assert
      expect(writeTextFile).toHaveBeenCalledTimes(1);
      const writtenContent = writeTextFile.mock.calls[0][1];
      const terraTokensMatches = writtenContent.match(/"terraTokens":\d+/);
      expect(terraTokensMatches[0]).toBe('"terraTokens":30');
    });
  });

  describe('When a custom input directory is provided', () => {
    it('should read save folders from that directory', async () => {
      // Arrange
      ({main} = initCli(['--input=custom-input']));
      readDirectory.mockResolvedValueOnce([]);

      // Act
      await main();

      // Assert
      expect(readDirectory).toHaveBeenCalledWith('custom-input');
    });
  });

  describe('When a custom output directory is provided', () => {
    it('should write the merged file under that directory', async () => {
      // Arrange
      ({main} = initCli(['--output=custom-output']));
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
      expect(writeTextFile.mock.calls[0][0]).toBe(`custom-output/${INPUT_SUBFOLDER_ALPHA}/Standard-1-Standard-2-merged.json`);
    });
  });

  describe('When a merged save is in the legacy format', () => {
    beforeEach(() => {
      readDirectory.mockResolvedValueOnce([INPUT_SUBFOLDER_ALPHA]);
      readDirectory.mockResolvedValueOnce([SAVE_A_FILENAME, SAVE_B_FILENAME]);
      readDirectory.mockResolvedValueOnce([SAVE_A_FILENAME, SAVE_B_FILENAME]);
      readTextFile.mockImplementation((path) => {
        if (path === SAVE_A_INPUT_PATH) return Promise.resolve(LEGACY_FAKE_SAVE_STRING_A);
        if (path === SAVE_B_INPUT_PATH) return Promise.resolve(FAKE_SAVE_STRING_B);
        return Promise.reject(new Error(`Unexpected path: ${path}`));
      });
    });

    it('should warn about the format adaptation before writing the merged file', async () => {
      // Act
      await main();

      // Assert
      expect(consoleErrorSpy).toHaveBeenCalledWith(`⚠ Folder "${INPUT_SUBFOLDER_ALPHA}" [save A] This save was created by an older version of the game and has been adapted to the current format. The obsolete Terrain Layers section was ignored.`);
    });

    it('should still write the merged file and exit successfully', async () => {
      // Act
      await main();

      // Assert
      expect(writeTextFile.mock.calls[0][0]).toBe(MERGED_SAVE_OUTPUT_PATH);
      expect(exitProcess).toHaveBeenCalledWith(0);
    });
  });
});
