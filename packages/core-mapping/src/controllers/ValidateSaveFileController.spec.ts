import {describe, expect, it} from 'bun:test';
import {ValidateSaveFileController} from './ValidateSaveFileController';
import {createFakeSaveContent, createLegacyFakeSaveContent} from 'shared-save-processing/testing/createFakeSaveContent.js';
import {SaveFileValidationViewModel} from '../presentation/viewModels/SaveFileValidationViewModel';

describe('ValidateSaveFileController', () => {
  it('should validate a valid save file', async () => {
    // Act
    const viewModel = await ValidateSaveFileController.validateSaveFile('Save-A.json', createFakeSaveContent());

    // Assert
    expect<SaveFileValidationViewModel>(viewModel).toEqual({status: 'valid', errors: [], warnings: []});
  });

  it('should report the errors of an invalid save file', async () => {
    // Act
    const viewModel = await ValidateSaveFileController.validateSaveFile('Save-A.json', 'not a valid save at all');

    // Assert
    expect<SaveFileValidationViewModel>(viewModel).toEqual({
      status: 'invalid',
      errors: [{message: 'Expected 11 sections but found 1', location: null}],
      warnings: []
    });
  });

  it('should report a legacy save file as valid with a user message about the format adaptation', async () => {
    // Act
    const viewModel = await ValidateSaveFileController.validateSaveFile('Save-A.json', createLegacyFakeSaveContent());

    // Assert
    expect<SaveFileValidationViewModel>(viewModel).toEqual({
      status: 'valid',
      errors: [],
      warnings: [{
        message: 'This save was created by an older version of the game and has been adapted to the current format. The obsolete Terrain Layers section was ignored.',
        location: null
      }]
    });
  });
});
