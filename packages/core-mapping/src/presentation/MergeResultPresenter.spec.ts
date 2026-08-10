import {describe, expect, it} from 'bun:test';
import {MergeResultPresenter} from './MergeResultPresenter';

describe('MergeResultPresenter', () => {

  describe('When presenting a merge success', () => {
    it('should update the view model with the success status, file name and content', () => {
      // Arrange
      const presenter = new MergeResultPresenter();

      // Act
      presenter.presentMergeSucceeded('merged.json', 'merged content');

      // Assert
      expect(presenter.viewModel).toEqual({
        status: 'success',
        fileName: 'merged.json',
        content: 'merged content',
        saveAErrorMessages: [],
        saveBErrorMessages: []
      });
    });
  });

  describe('When presenting invalid save files', () => {
    it('should update the view model with the validation error status and each save error messages', () => {
      // Arrange
      const presenter = new MergeResultPresenter();

      // Act
      presenter.presentSaveFilesInvalid(['Invalid JSON: contentA'], []);

      // Assert
      expect(presenter.viewModel).toEqual({
        status: 'validationError',
        fileName: '',
        content: '',
        saveAErrorMessages: ['Invalid JSON: contentA'],
        saveBErrorMessages: []
      });
    });
  });
});
