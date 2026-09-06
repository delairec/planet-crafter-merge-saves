import {describe, expect, it} from 'bun:test';
import {MergeResultPresenter} from './MergeResultPresenter';
import {VALIDATION_ISSUE_CODES} from '../application/ports/ValidationIssue';

describe('MergeResultPresenter', () => {

  describe('When presenting a merge success', () => {
    it('should update the view model with the success status, file name and content', () => {
      // Arrange
      const presenter = new MergeResultPresenter();

      // Act
      presenter.presentMergeSucceeded('merged.json', 'merged content', [], []);

      // Assert
      expect(presenter.viewModel).toEqual({
        status: 'success',
        fileName: 'merged.json',
        content: 'merged content',
        saveAErrorMessages: [],
        saveBErrorMessages: [],
        saveAWarningMessages: [],
        saveBWarningMessages: []
      });
    });

    it('should translate the warning codes of each merged save into user messages', () => {
      // Arrange
      const presenter = new MergeResultPresenter();

      // Act
      presenter.presentMergeSucceeded('merged.json', 'merged content', ['legacy-save-format'], []);

      // Assert
      expect(presenter.viewModel.saveAWarningMessages).toEqual(['This save was created by an older version of the game and has been adapted to the current format. The obsolete Terrain Layers section was ignored.']);
      expect(presenter.viewModel.saveBWarningMessages).toEqual([]);
    });
  });

  describe('When presenting invalid save files', () => {
    it('should update the view model with the validation error status and each save error messages', () => {
      // Arrange
      const presenter = new MergeResultPresenter();

      // Act
      presenter.presentSaveFilesInvalid([{code: VALIDATION_ISSUE_CODES.INVALID_JSON, detail: 'Invalid JSON: contentA'}], [], [], []);

      // Assert
      expect(presenter.viewModel).toEqual({
        status: 'validationError',
        fileName: '',
        content: '',
        saveAErrorMessages: ['Invalid JSON: contentA'],
        saveBErrorMessages: [],
        saveAWarningMessages: [],
        saveBWarningMessages: []
      });
    });

    it('should keep the warning messages alongside the errors', () => {
      // Arrange
      const presenter = new MergeResultPresenter();

      // Act
      presenter.presentSaveFilesInvalid([{code: VALIDATION_ISSUE_CODES.INVALID_JSON, detail: 'Invalid JSON: contentA'}], [], [], ['legacy-save-format']);

      // Assert
      expect(presenter.viewModel.saveBWarningMessages).toEqual(['This save was created by an older version of the game and has been adapted to the current format. The obsolete Terrain Layers section was ignored.']);
    });
  });
});
