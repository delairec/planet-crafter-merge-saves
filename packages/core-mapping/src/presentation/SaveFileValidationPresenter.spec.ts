import {describe, expect, it} from 'bun:test';
import {SaveFileValidationPresenter} from './SaveFileValidationPresenter';
import {VALIDATION_ISSUE_CODES} from '../application/ports/ValidationIssue';


describe('SaveFileValidationPresenter', () => {

  describe('When presenting a valid save file', () => {
    it('should update the view model with the valid status and no error messages', () => {
      // Arrange
      const presenter = new SaveFileValidationPresenter();

      // Act
      presenter.presentValidSaveFile([]);

      // Assert
      expect(presenter.viewModel).toEqual({status: 'valid', errorMessages: [], warnings: []});
    });

    it('should translate the warning codes into user messages', () => {
      // Arrange
      const presenter = new SaveFileValidationPresenter();

      // Act
      presenter.presentValidSaveFile(['legacy-save-format']);

      // Assert
      expect(presenter.viewModel.warnings).toEqual(['This save was created by an older version of the game and has been adapted to the current format. The obsolete Terrain Layers section was ignored.']);
    });
  });

  describe('When presenting an invalid save file', () => {
    it('should update the view model with the invalid status and the formatted error messages', () => {
      // Arrange
      const presenter = new SaveFileValidationPresenter();

      // Act
      presenter.presentInvalidSaveFile([{code: VALIDATION_ISSUE_CODES.INVALID_EXTENSION, detail: 'Invalid file extension: expected a .json file.'}], []);

      // Assert
      expect(presenter.viewModel).toEqual({
        status: 'invalid',
        errorMessages: ['Invalid file extension: expected a .json file.'],
        warnings: []
      });
    });

    it('should keep the warning messages alongside the errors', () => {
      // Arrange
      const presenter = new SaveFileValidationPresenter();

      // Act
      presenter.presentInvalidSaveFile([{code: VALIDATION_ISSUE_CODES.INVALID_JSON, detail: 'Invalid JSON: {'}], ['legacy-save-format']);

      // Assert
      expect(presenter.viewModel.warnings).toEqual(['This save was created by an older version of the game and has been adapted to the current format. The obsolete Terrain Layers section was ignored.']);
    });
  });
});
