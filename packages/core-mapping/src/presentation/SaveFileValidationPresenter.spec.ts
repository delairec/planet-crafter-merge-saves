import {describe, expect, it} from 'bun:test';
import {SaveFileValidationPresenter} from './SaveFileValidationPresenter';

describe('SaveFileValidationPresenter', () => {

  describe('When presenting a valid save file', () => {
    it('should update the view model with the valid status and no error messages', () => {
      // Arrange
      const presenter = new SaveFileValidationPresenter();

      // Act
      presenter.presentValidSaveFile();

      // Assert
      expect(presenter.viewModel).toEqual({status: 'valid', errorMessages: []});
    });
  });

  describe('When presenting an invalid save file', () => {
    it('should update the view model with the invalid status and the error messages', () => {
      // Arrange
      const presenter = new SaveFileValidationPresenter();

      // Act
      presenter.presentInvalidSaveFile(['Invalid file extension: expected a .json file.']);

      // Assert
      expect(presenter.viewModel).toEqual({
        status: 'invalid',
        errorMessages: ['Invalid file extension: expected a .json file.']
      });
    });
  });
});
