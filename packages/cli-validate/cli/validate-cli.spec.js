import {beforeEach, describe, expect, it, mock, spyOn} from 'bun:test';
import {initValidateCli} from './validate-cli.js';
import {VALIDATE_SAVE_FILE_PATH} from '../testing/fakePaths.js';
import {VALID_SAVE_CONTENT} from '../testing/fakeValidSaveContent.js';
import {INVALID_SAVE_CONTENT} from '../testing/fakeInvalidSaveContent.js';
import {createLegacyFakeSaveContent} from 'shared-save-processing/testing/createFakeSaveContent.js';

describe('Validate CLI', () => {
  let consoleLogSpy;
  let consoleErrorSpy;
  let consoleWarnSpy;
  let readTextFile;
  let exitProcess;
  let main;

  beforeEach(() => {
    consoleLogSpy = spyOn(console, 'log').mockImplementation(() => {
    });
    consoleErrorSpy = spyOn(console, 'error').mockImplementation(() => {
    });
    consoleWarnSpy = spyOn(console, 'warn').mockImplementation(() => {
    });

    readTextFile = mock();
    exitProcess = mock();

    const fakePlatform = {
      readTextFile,
      exitProcess,
      getCliArguments: () => ['bun', 'src/validate-cli.js', VALIDATE_SAVE_FILE_PATH],
      isEntryPoint: () => false
    };

    ({main} = initValidateCli(fakePlatform));
  });

  describe('When no file path is provided', () => {
    it('should exit with code 1', async () => {
      // Act
      await main(undefined);

      // Assert
      expect(exitProcess).toHaveBeenCalledWith(1);
    });

    it('should print a usage message', async () => {
      // Act
      await main(undefined);

      // Assert
      expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('Usage:'));
    });

    it('should not read any file', async () => {
      // Act
      await main(undefined);

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

    it('should exit with code 0', async () => {
      // Arrange
      readTextFile.mockResolvedValue(VALID_SAVE_CONTENT);

      // Act
      await main(VALIDATE_SAVE_FILE_PATH);

      // Assert
      expect(exitProcess).toHaveBeenCalledWith(0);
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
    it('should exit with code 1', async () => {
      // Arrange
      readTextFile.mockResolvedValue(INVALID_SAVE_CONTENT);

      // Act
      await main(VALIDATE_SAVE_FILE_PATH);

      // Assert
      expect(exitProcess).toHaveBeenCalledWith(1);
    });

    it('should log an error message listing the number of errors', async () => {
      // Arrange
      readTextFile.mockResolvedValue(INVALID_SAVE_CONTENT);

      // Act
      await main(VALIDATE_SAVE_FILE_PATH);

      // Assert
      expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('error'));
    });
  });

  describe('When the save file is in the legacy format', () => {
    it('should warn with a user message instead of the warning code', async () => {
      // Arrange
      readTextFile.mockResolvedValue(createLegacyFakeSaveContent());

      // Act
      await main(VALIDATE_SAVE_FILE_PATH);

      // Assert
      expect(consoleWarnSpy).toHaveBeenCalledWith('⚠ This save was created by an older version of the game and has been adapted to the current format. The obsolete Terrain Layers section was ignored.');
    });

    it('should still report the save as valid', async () => {
      // Arrange
      readTextFile.mockResolvedValue(createLegacyFakeSaveContent());

      // Act
      await main(VALIDATE_SAVE_FILE_PATH);

      // Assert
      expect(exitProcess).toHaveBeenCalledWith(0);
    });
  });
});
