import {describe, expect, it} from 'bun:test';
import {ValidateSaveFileController} from './ValidateSaveFileController';
import {createFakeSaveContent} from 'shared-save-processing/testing/createFakeSaveContent.js';

describe('ValidateSaveFileController', () => {
  it('should validate a valid save file', async () => {
    // Act
    const viewModel = await ValidateSaveFileController.validateSaveFile('Save-A.json', createFakeSaveContent());

    // Assert
    expect(viewModel).toEqual({status: 'valid', errorMessages: []});
  });
});
