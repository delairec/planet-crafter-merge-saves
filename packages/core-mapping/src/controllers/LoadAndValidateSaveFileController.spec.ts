import {describe, expect, it} from 'bun:test';
import {LoadAndValidateSaveFileController} from './LoadAndValidateSaveFileController';
import {createFakeSaveContent} from 'shared-save-processing/testing/createFakeSaveContent.js';

describe('LoadAndValidateSaveFileController', () => {

  describe('When the file name has an invalid extension', () => {
    it('should return an invalid view model without sections', async () => {
      // Act
      const viewModel = await LoadAndValidateSaveFileController.loadAndValidateSaveFile('Save-A.txt', createFakeSaveContent());

      // Assert
      expect(viewModel.status).toBe('invalid');
      expect(viewModel.sections).toBeNull();
      expect(viewModel.errorMessages).toEqual(['Invalid file extension: expected a .json file.']);
    });
  });

  describe('When the file name has a valid extension and the content is a valid save', () => {
    it('should return a valid view model with the parsed sections', async () => {
      // Act
      const viewModel = await LoadAndValidateSaveFileController.loadAndValidateSaveFile('Save-A.json', createFakeSaveContent());

      // Assert
      expect(viewModel.status).toBe('valid');
      expect(viewModel.sections).not.toBeNull();
      expect(viewModel.errorMessages).toEqual([]);
      expect(viewModel.warnings).toEqual([]);
    });
  });

  describe('When the file name has a valid extension but the content is not a valid save', () => {
    it('should return an invalid view model with the content validation error messages', async () => {
      // Act
      const viewModel = await LoadAndValidateSaveFileController.loadAndValidateSaveFile('Save-A.json', 'not a valid save at all');

      // Assert
      expect(viewModel.status).toBe('invalid');
      expect(viewModel.sections).toBeNull();
      expect(viewModel.errorMessages).toEqual(['Expected 11 sections but found 1']);
    });
  });
});
