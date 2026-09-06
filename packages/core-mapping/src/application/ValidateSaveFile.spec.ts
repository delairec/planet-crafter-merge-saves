import {describe, expect, it, mock} from 'bun:test';
import {ValidateSaveFile} from './ValidateSaveFile';
import {SaveValidatorPort} from './ports/SaveValidatorPort';
import {SaveFileValidationPresenterPort} from './ports/SaveFileValidationPresenterPort';
import {VALIDATION_ISSUE_CODES} from './ports/ValidationIssue';

describe('ValidateSaveFile', () => {

  describe('When the save file is valid', () => {
    it('should present a valid save file', async () => {
      // Arrange
      const validator: SaveValidatorPort = {validate: mock(() => ({isValid: true, errors: [], warnings: []}))};
      const presenter: SaveFileValidationPresenterPort = {presentValidSaveFile: mock(), presentInvalidSaveFile: mock()};
      const useCase = new ValidateSaveFile(validator, presenter);

      // Act
      await useCase.execute({fileName: 'Save-A.json', content: 'content'});

      // Assert
      expect(validator.validate).toHaveBeenCalledWith('Save-A.json', 'content');
      expect(presenter.presentValidSaveFile).toHaveBeenCalledWith([]);
      expect(presenter.presentInvalidSaveFile).not.toHaveBeenCalled();
    });
  });

  describe('When the save file is invalid', () => {
    it('should present an invalid save file with the validation errors', async () => {
      // Arrange
      const errors = [{code: VALIDATION_ISSUE_CODES.INVALID_EXTENSION, detail: 'Invalid file extension: expected a .json file.'}];
      const validator: SaveValidatorPort = {
        validate: mock(() => ({isValid: false, errors, warnings: []}))
      };
      const presenter: SaveFileValidationPresenterPort = {presentValidSaveFile: mock(), presentInvalidSaveFile: mock()};
      const useCase = new ValidateSaveFile(validator, presenter);

      // Act
      await useCase.execute({fileName: 'Save-A.txt', content: 'content'});

      // Assert
      expect(presenter.presentInvalidSaveFile).toHaveBeenCalledWith(errors, []);
      expect(presenter.presentValidSaveFile).not.toHaveBeenCalled();
    });
  });

  describe('When validation reports that the save had to be adapted', () => {
    it('should present the warnings of a valid save file', () => {
      // Arrange
      const validator: SaveValidatorPort = {validate: mock(() => ({isValid: true, errors: [], warnings: ['legacy-save-format' as const]}))};
      const presenter: SaveFileValidationPresenterPort = {presentValidSaveFile: mock(), presentInvalidSaveFile: mock()};
      const useCase = new ValidateSaveFile(validator, presenter);

      // Act
      useCase.execute({fileName: 'Save-A.json', content: 'content'});

      // Assert
      expect(presenter.presentValidSaveFile).toHaveBeenCalledWith(['legacy-save-format']);
    });

    it('should present the warnings of an invalid save file too', () => {
      // Arrange
      const errors = [{code: VALIDATION_ISSUE_CODES.INVALID_JSON, detail: 'Invalid JSON: {'}];
      const validator: SaveValidatorPort = {validate: mock(() => ({isValid: false, errors, warnings: ['legacy-save-format' as const]}))};
      const presenter: SaveFileValidationPresenterPort = {presentValidSaveFile: mock(), presentInvalidSaveFile: mock()};
      const useCase = new ValidateSaveFile(validator, presenter);

      // Act
      useCase.execute({fileName: 'Save-A.json', content: 'content'});

      // Assert
      expect(presenter.presentInvalidSaveFile).toHaveBeenCalledWith(errors, ['legacy-save-format']);
    });
  });
});
