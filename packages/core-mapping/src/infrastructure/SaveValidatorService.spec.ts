import {describe, expect, it} from 'bun:test';
import {SaveValidatorService} from './SaveValidatorService';
import {createFakeSaveContent} from 'shared-mapping/testing/createFakeSaveContent.js';

describe('SaveValidatorService', () => {

  describe('When the file name has an invalid extension', () => {
    it('should return an invalid result without checking the content', () => {
      // Arrange
      const service = new SaveValidatorService();
      const content = createFakeSaveContent();

      // Act
      const result = service.validate('Save-A.txt', content);

      // Assert
      expect(result).toEqual({
        isValid: false,
        errorMessages: ['Invalid file extension: expected a .json file.']
      });
    });
  });

  describe('When the file name has a valid extension and the save content is valid', () => {
    it('should return a valid result with no error messages', () => {
      // Arrange
      const service = new SaveValidatorService();
      const content = createFakeSaveContent();

      // Act
      const result = service.validate('Save-A.json', content);

      // Assert
      expect(result).toEqual({isValid: true, errorMessages: []});
    });
  });

  describe('When the file name has a valid extension and the save content is invalid', () => {
    it('should return an invalid result with the validation error messages', () => {
      // Arrange
      const service = new SaveValidatorService();
      const content = 'not a valid save at all';

      // Act
      const result = service.validate('Save-A.json', content);

      // Assert
      expect(result).toEqual({
        isValid: false,
        errorMessages: ['Expected 11 sections but found 1']
      });
    });
  });
});
