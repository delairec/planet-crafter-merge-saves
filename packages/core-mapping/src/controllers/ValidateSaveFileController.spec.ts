import {describe, expect, it} from 'bun:test';
import {ValidateSaveFileController} from './ValidateSaveFileController';
import {createFakeSaveContent} from 'shared-save-processing/testing/createFakeSaveContent.js';

// Orchestration branches (valid/invalid) are covered with test doubles in application/ValidateSaveFile.spec.ts;
// the extension/content validation mapping is covered in infrastructure/SaveValidatorService.spec.ts.
// This spec keeps a single full-stack test wiring the real dependencies as a safety net.
describe('ValidateSaveFileController', () => {
  it('should validate a valid save file end-to-end with the real dependencies', async () => {
    // Act
    const viewModel = await ValidateSaveFileController.validateSaveFile('Save-A.json', createFakeSaveContent());

    // Assert
    expect(viewModel).toEqual({status: 'valid', errorMessages: []});
  });
});
