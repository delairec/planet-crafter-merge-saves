import {describe, expect, it} from 'bun:test';
import {ValidateSaveFileController} from './ValidateSaveFileController.ts';
import {createFakeSaveContent, createLegacyFakeSaveContent} from 'shared-save-processing/testing/createFakeSaveContent.js';

describe('ValidateSaveFileController', () => {
  it('should validate a valid save file', async () => {
    // Act
    const viewModel = await ValidateSaveFileController.validateSaveFile('Save-A.json', createFakeSaveContent());

    // Assert
    expect(viewModel).toEqual({status: 'valid', errorMessages: [], errors: [], warnings: []});
  });

  it('should report the errors of an invalid save file', async () => {
    // Act
    const viewModel = await ValidateSaveFileController.validateSaveFile('Save-A.json', 'not a valid save at all');

    // Assert
    expect(viewModel).toEqual({
      status: 'invalid',
      errorMessages: ['Expected 11 sections but found 1'],
      errors: [{message: 'Expected 11 sections but found 1'}],
      warnings: []
    });
  });

  it('should report a legacy save file as valid with a user message about the format adaptation', async () => {
    // Act
    const viewModel = await ValidateSaveFileController.validateSaveFile('Save-A.json', createLegacyFakeSaveContent());

    // Assert
    expect(viewModel).toEqual({
      status: 'valid',
      errorMessages: [],
      errors: [],
      warnings: ['This save was created by an older version of the game and has been adapted to the current format. The obsolete Terrain Layers section was ignored.']
    });
  });
});
