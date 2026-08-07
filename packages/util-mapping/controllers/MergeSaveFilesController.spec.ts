import {describe, it, expect} from 'bun:test';
import {MergeSaveFilesController} from './MergeSaveFilesController';
import {createFakeSaveContent} from '../../util-testing/fixtures/createFakeSaveContent.js';

describe('MergeSaveFilesController', () => {

  describe('When both saves are valid', () => {
    it('should return a success view model with the merged file name', () => {
      // Arrange
      const contentA = createFakeSaveContent();
      const contentB = createFakeSaveContent();

      // Act
      const viewModel = MergeSaveFilesController.mergeSaveFiles('Standard-1.json', contentA, 'Standard-2.json', contentB);

      // Assert
      expect(viewModel.status).toBe('success');
      expect(viewModel.fileName).toBe('Standard-1-Standard-2-merged.json');
    });
  });

  describe('When at least one save is invalid', () => {
    it('should return a validation error view model with the invalid save error messages', () => {
      // Arrange
      const contentA = 'not a valid save at all';
      const contentB = createFakeSaveContent();

      // Act
      const viewModel = MergeSaveFilesController.mergeSaveFiles('Standard-1.json', contentA, 'Standard-2.json', contentB);

      // Assert
      expect(viewModel.status).toBe('validationError');
      expect(viewModel.saveAErrorMessages).toEqual(['Expected 11 sections but found 1']);
      expect(viewModel.saveBErrorMessages).toEqual([]);
    });
  });
});
