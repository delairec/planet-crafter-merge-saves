import {describe, expect, it, mock} from 'bun:test';
import {ValidateSaveFile} from './ValidateSaveFile';
import {SaveValidatorPort} from './ports/SaveValidatorPort';
import {SaveFileValidationPresenterPort} from './ports/SaveFileValidationPresenterPort';

describe('ValidateSaveFile', () => {

  describe('When the save file is valid', () => {
    it('should present a valid save file', () => {
      // Arrange
      const validator: SaveValidatorPort = {validate: mock(() => ({isValid: true, errorMessages: []}))};
      const presenter: SaveFileValidationPresenterPort = {presentValidSaveFile: mock(), presentInvalidSaveFile: mock()};
      const useCase = new ValidateSaveFile(validator, presenter);

      // Act
      useCase.execute('Save-A.json', 'content');

      // Assert
      expect(validator.validate).toHaveBeenCalledWith('Save-A.json', 'content');
      expect(presenter.presentValidSaveFile).toHaveBeenCalledTimes(1);
      expect(presenter.presentInvalidSaveFile).not.toHaveBeenCalled();
    });
  });

  describe('When the save file is invalid', () => {
    it('should present an invalid save file with the validation error messages', () => {
      // Arrange
      const validator: SaveValidatorPort = {
        validate: mock(() => ({isValid: false, errorMessages: ['Invalid file extension: expected a .json file.']}))
      };
      const presenter: SaveFileValidationPresenterPort = {presentValidSaveFile: mock(), presentInvalidSaveFile: mock()};
      const useCase = new ValidateSaveFile(validator, presenter);

      // Act
      useCase.execute('Save-A.txt', 'content');

      // Assert
      expect(presenter.presentInvalidSaveFile).toHaveBeenCalledWith(['Invalid file extension: expected a .json file.']);
      expect(presenter.presentValidSaveFile).not.toHaveBeenCalled();
    });
  });
});
