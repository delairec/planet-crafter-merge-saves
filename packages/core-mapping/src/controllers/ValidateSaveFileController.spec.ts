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

  it('should report the errors of an invalid save file', async () => {
    // Act
    const viewModel = await ValidateSaveFileController.validateSaveFile('Save-A.json', 'not a valid save at all');

    // Assert
    expect(viewModel).toEqual({status: 'invalid', errorMessages: ['Expected 11 sections but found 1']});
  });
});
