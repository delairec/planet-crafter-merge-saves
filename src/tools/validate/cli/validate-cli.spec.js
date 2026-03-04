import {beforeEach, describe, expect, it, mock, spyOn} from 'bun:test';
import {initValidateCli} from './validate-cli.js';
import {VALIDATE_SAVE_FILE_PATH} from '../../../utils/testing/fixtures/fakePaths.js';
import {VALID_SAVE_CONTENT} from '../../../utils/testing/fixtures/validate-cli/fakeValidSaveContent.js';
import {INVALID_SAVE_CONTENT} from '../../../utils/testing/fixtures/validate-cli/fakeInvalidSaveContent.js';

describe('Validate CLI', () => {
  let consoleLogSpy;
  let consoleErrorSpy;
  let readTextFile;
  let exitProcess;
  let main;

  beforeEach(() => {
    consoleLogSpy = spyOn(console, 'log').mockImplementation(() => {
    });
    consoleErrorSpy = spyOn(console, 'error').mockImplementation(() => {
    });

    readTextFile = mock();
    exitProcess = mock(() => {
      throw new Error('process.exit called');
    });

    const fakePlatform = {
      readTextFile,
      exitProcess,
      getCliArguments: () => ['bun', 'src/validate-cli.js', VALIDATE_SAVE_FILE_PATH],
      isEntryPoint: () => false
    };

    ({main} = initValidateCli(fakePlatform));
  });

  describe('When no file path is provided', () => {
    it('should exit with code 1', () => {
      // Arrange / Act / Assert
      expect(main(undefined)).rejects.toThrow('process.exit called');
      expect(exitProcess).toHaveBeenCalledWith(1);
    });

    it('should print a usage message', async () => {
      // Arrange / Act
      await main(undefined).catch(() => {
      });

      // Assert
      expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('Usage:'));
    });

    it('should not read any file', async () => {
      // Arrange / Act
      await main(undefined).catch(() => {
      });

      // Assert
      expect(readTextFile).not.toHaveBeenCalled();
    });
  });

  describe('When the save file is valid', () => {
    it('should log a success message', async () => {
      // Arrange
      readTextFile.mockResolvedValue(VALID_SAVE_CONTENT);

      // Act
      await main(VALIDATE_SAVE_FILE_PATH);

      // Assert
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('✓'));
    });

    it('should not exit with an error code', async () => {
      // Arrange
      readTextFile.mockResolvedValue(VALID_SAVE_CONTENT);

      // Act
      await main(VALIDATE_SAVE_FILE_PATH);

      // Assert
      expect(exitProcess).not.toHaveBeenCalled();
    });

    it('should read the file at the given path', async () => {
      // Arrange
      readTextFile.mockResolvedValue(VALID_SAVE_CONTENT);

      // Act
      await main(VALIDATE_SAVE_FILE_PATH);

      // Assert
      expect(readTextFile).toHaveBeenCalledWith(VALIDATE_SAVE_FILE_PATH);
    });
  });

  describe('When the save file is invalid', () => {
    it('should exit with code 1', () => {
      // Arrange
      readTextFile.mockResolvedValue(INVALID_SAVE_CONTENT);

      // Act / Assert
      expect(main(VALIDATE_SAVE_FILE_PATH)).rejects.toThrow('process.exit called');
      expect(exitProcess).toHaveBeenCalledWith(1);
    });

    it('should log an error message listing the number of errors', async () => {
      // Arrange
      readTextFile.mockResolvedValue(INVALID_SAVE_CONTENT);

      // Act
      await main(VALIDATE_SAVE_FILE_PATH).catch(() => {
      });

      // Assert
      expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('error'));
    });
  });
});
