import {describe, expect, it} from 'bun:test';
import {MergeSaveFilesController} from './MergeSaveFilesController';
import {createFakeSaveContent} from 'shared-save-processing/testing/createFakeSaveContent.js';

// Orchestration branches (success and validation error) are covered with test doubles in
// application/MergeSaveFiles.spec.ts; the validator/merger mapping details are covered in
// infrastructure/SaveValidatorService.spec.ts and infrastructure/SaveFilesMergerService.spec.ts.
// This spec keeps a single full-stack test wiring the real dependencies as a safety net.
describe('MergeSaveFilesController', () => {
  it('should merge two valid saves end-to-end with the real dependencies', async () => {
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
