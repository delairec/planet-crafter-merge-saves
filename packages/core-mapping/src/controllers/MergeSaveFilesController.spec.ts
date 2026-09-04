import {describe, expect, it} from 'bun:test';
import {MergeSaveFilesController} from './MergeSaveFilesController';
import {createFakeSaveContent} from 'shared-save-processing/testing/createFakeSaveContent.js';

describe('MergeSaveFilesController', () => {

  describe('When both saves are valid', () => {
    it('should return a success view model with the merged file name', async () => {
      // Arrange
      const contentA = createFakeSaveContent();
      const contentB = createFakeSaveContent();

      // Act
      const viewModel = await MergeSaveFilesController.mergeSaveFiles({
        fileNameA: 'Standard-1.json',
        contentA,
        fileNameB: 'Standard-2.json',
        contentB
      });

      // Assert
      expect(viewModel.status).toBe('success');
      expect(viewModel.fileName).toBe('Standard-1-Standard-2-merged.json');
    });
  });

  describe('When at least one save is invalid', () => {
    it('should return a validation error view model with the invalid save error messages', async () => {
      // Arrange
      const contentA = 'not a valid save at all';
      const contentB = createFakeSaveContent();

      // Act
      const viewModel = await MergeSaveFilesController.mergeSaveFiles({
        fileNameA: 'Standard-1.json',
        contentA,
        fileNameB: 'Standard-2.json',
        contentB
      });

      // Assert
      expect(viewModel.status).toBe('validationError');
      expect(viewModel.saveAErrorMessages).toEqual(['Expected 11 sections but found 1']);
      expect(viewModel.saveBErrorMessages).toEqual([]);
    });
  });
});
