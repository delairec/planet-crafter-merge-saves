import {describe, expect, it} from 'bun:test';
import {MergeSaveFilesController} from './MergeSaveFilesController';
import {createFakeSaveContent, createLegacyFakeSaveContent} from 'shared-save-processing/testing/createFakeSaveContent.js';
import {SaveValidationMessageViewModel} from '../presentation/viewModels/SaveFileValidationViewModel';

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

  it('should report the errors of an invalid save', async () => {
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
    expect<SaveValidationMessageViewModel[]>(viewModel.saveAErrors).toEqual([{message: 'Expected 11 sections but found 1', location: null}]);
    expect<SaveValidationMessageViewModel[]>(viewModel.saveBErrors).toEqual([]);
  });

  it('should report a user message about the format adaptation when a merged save is in the legacy format', async () => {
    // Arrange
    const contentA = createLegacyFakeSaveContent();
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
    expect<SaveValidationMessageViewModel[]>(viewModel.saveAWarnings).toEqual([{
      message: 'This save was created by an older version of the game and has been adapted to the current format. The obsolete Terrain Layers section was ignored.',
      location: null
    }]);
    expect<SaveValidationMessageViewModel[]>(viewModel.saveBWarnings).toEqual([]);
  });
});
