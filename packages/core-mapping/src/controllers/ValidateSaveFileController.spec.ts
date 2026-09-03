import {describe, expect, it} from 'bun:test';
import {ValidateSaveFileController} from './ValidateSaveFileController';
import {createFakeSaveContent} from 'shared-mapping/testing/createFakeSaveContent.js';

describe('ValidateSaveFileController', () => {

  describe('When the file name has an invalid extension', () => {
    it('should return an invalid view model', () => {
      // Act
      const viewModel = ValidateSaveFileController.validateSaveFile('Save-A.txt', createFakeSaveContent());

      // Assert
      expect(viewModel.status).toBe('invalid');
      expect(viewModel.errorMessages).toEqual(['Invalid file extension: expected a .json file.']);
    });
  });

  describe('When the file name has a valid extension and the content is a valid save', () => {
    it('should return a valid view model', () => {
      // Act
      const viewModel = ValidateSaveFileController.validateSaveFile('Save-A.json', createFakeSaveContent());

      // Assert
      expect(viewModel).toEqual({status: 'valid', errorMessages: []});
    });
  });

  describe('When the file name has a valid extension but the content is not a valid save', () => {
    it('should return an invalid view model with the content validation error messages', () => {
      // Act
      const viewModel = ValidateSaveFileController.validateSaveFile('Save-A.json', 'not a valid save at all');

      // Assert
      expect(viewModel.status).toBe('invalid');
      expect(viewModel.errorMessages).toEqual(['Expected 11 sections but found 1']);
    });
  });
});
