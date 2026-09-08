import {describe, expect, it} from 'bun:test';
import {SaveFileValidationPresenter} from './SaveFileValidationPresenter';
import {VALIDATION_ISSUE_CODES} from '../application/ports/ValidationIssue';
import {SaveWarningCode} from 'shared-save-processing/normalizeRawSections.js';
import {SaveFileValidationViewModel, SaveValidationMessageViewModel} from './viewModels/SaveFileValidationViewModel';

const noWarnings: SaveWarningCode[] = [];

describe('SaveFileValidationPresenter', () => {

  describe('When presenting a valid save file', () => {
    it('should update the view model with the valid status and no error', () => {
      // Arrange
      const presenter = new SaveFileValidationPresenter();

      // Act
      presenter.presentValidSaveFile(noWarnings);

      // Assert
      expect<SaveFileValidationViewModel>(presenter.viewModel).toEqual({status: 'valid', errors: [], warnings: []});
    });

    it('should translate the warning codes into user messages', () => {
      // Arrange
      const presenter = new SaveFileValidationPresenter();

      // Act
      presenter.presentValidSaveFile(['legacy-save-format']);

      // Assert
      expect<SaveValidationMessageViewModel[]>(presenter.viewModel.warnings).toEqual([{
        message: 'This save was created by an older version of the game and has been adapted to the current format. The obsolete Terrain Layers section was ignored.',
        location: null
      }]);
    });
  });

  describe('When presenting an invalid save file', () => {
    it('should update the view model with the invalid status and the formatted errors', () => {
      // Arrange
      const presenter = new SaveFileValidationPresenter();

      // Act
      presenter.presentInvalidSaveFile([{code: VALIDATION_ISSUE_CODES.INVALID_EXTENSION, detail: 'Invalid file extension: expected a .json file.'}], noWarnings);

      // Assert
      expect<SaveFileValidationViewModel>(presenter.viewModel).toEqual({
        status: 'invalid',
        errors: [{message: 'Invalid file extension: expected a .json file.', location: null}],
        warnings: []
      });
    });

    it('should tell where in the save each error was found', () => {
      // Arrange
      const presenter = new SaveFileValidationPresenter();

      // Act
      presenter.presentInvalidSaveFile([{code: VALIDATION_ISSUE_CODES.INVALID_JSON, detail: 'Invalid JSON: {', section: 0, entryIndex: 3}], noWarnings);

      // Assert
      expect<SaveValidationMessageViewModel[]>(presenter.viewModel.errors).toEqual([{message: 'Invalid JSON: {', location: 'Global metadata (section 0), entry 3'}]);
    });

    it('should keep the warnings alongside the errors', () => {
      // Arrange
      const presenter = new SaveFileValidationPresenter();

      // Act
      presenter.presentInvalidSaveFile([{code: VALIDATION_ISSUE_CODES.INVALID_JSON, detail: 'Invalid JSON: {'}], ['legacy-save-format']);

      // Assert
      expect<SaveValidationMessageViewModel[]>(presenter.viewModel.warnings).toEqual([{
        message: 'This save was created by an older version of the game and has been adapted to the current format. The obsolete Terrain Layers section was ignored.',
        location: null
      }]);
    });
  });
});
