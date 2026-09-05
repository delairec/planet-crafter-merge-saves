import {describe, expect, it} from 'bun:test';
import {MergeSaveFilesController} from './MergeSaveFilesController';
import {createFakeSaveContent} from 'shared-save-processing/testing/createFakeSaveContent.js';

describe('MergeSaveFilesController', () => {
  it('should merge two valid saves', async () => {
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
