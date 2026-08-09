import {describe, expect, it} from 'bun:test';
import {SaveValidatorService} from './SaveValidatorService';
import {createFakeSaveContent} from '../../../util-testing/fixtures/createFakeSaveContent.js';

describe('SaveValidatorService', () => {

  describe('When the save content is valid', () => {
    it('should return a valid result with no error messages', () => {
      // Arrange
      const service = new SaveValidatorService();
      const content = createFakeSaveContent();

      // Act
      const result = service.validate(content);

      // Assert
      expect(result).toEqual({isValid: true, errorMessages: []});
    });
  });

  describe('When the save content is invalid', () => {
    it('should return an invalid result with the validation error messages', () => {
      // Arrange
      const service = new SaveValidatorService();
      const content = 'not a valid save at all';

      // Act
      const result = service.validate(content);

      // Assert
      expect(result).toEqual({
        isValid: false,
        errorMessages: ['Expected 11 sections but found 1']
      });
    });
  });
});
