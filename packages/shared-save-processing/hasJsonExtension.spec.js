import {describe, it, expect} from 'bun:test';
import {hasJsonExtension} from './hasJsonExtension.js';

describe('hasJsonExtension', () => {

  describe('When the file name ends with .json', () => {
    it('should return true', () => {
      // Arrange
      const fileName = 'Save-A.json';

      // Act
      const result = hasJsonExtension(fileName);

      // Assert
      expect(result).toBe(true);
    });
  });

  describe('When the file name ends with .JSON in a different case', () => {
    it('should return true', () => {
      // Arrange
      const fileName = 'Save-A.JSON';

      // Act
      const result = hasJsonExtension(fileName);

      // Assert
      expect(result).toBe(true);
    });
  });

  describe('When the file name does not end with .json', () => {
    it('should return false', () => {
      // Arrange
      const fileName = 'Save-A.txt';

      // Act
      const result = hasJsonExtension(fileName);

      // Assert
      expect(result).toBe(false);
    });
  });
});
