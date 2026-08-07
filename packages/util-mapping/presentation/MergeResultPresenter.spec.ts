import {describe, it, expect} from 'bun:test';
import {MergeResultPresenter} from './MergeResultPresenter';

describe('MergeResultPresenter', () => {

  describe('When presenting a success outcome', () => {
    it('should update the view model with the success status, file name and content', () => {
      // Arrange
      const presenter = new MergeResultPresenter();

      // Act
      presenter.present({status: 'success', fileName: 'merged.json', content: 'merged content'});

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

  describe('When presenting a validation error outcome', () => {
    it('should update the view model with the validation error status and each save error messages', () => {
      // Arrange
      const presenter = new MergeResultPresenter();

      // Act
      presenter.present({
        status: 'validationError',
        saveAErrorMessages: ['Invalid JSON: contentA'],
        saveBErrorMessages: []
      });

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
