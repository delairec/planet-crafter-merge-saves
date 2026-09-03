import {describe, it, expect} from 'bun:test';
import {verifySectionCount} from './verifySectionCount.js';

describe('verifySectionCount', () => {

  describe('When the raw parts match the current 11-part format', () => {
    it('should report no error', () => {
      // Arrange
      const rawParts = Array.from({length: 11}, (_, index) => `part${index}`);

      // Act
      const errors = verifySectionCount(rawParts);

      // Assert
      expect(errors).toEqual([]);
    });
  });

  describe('When the raw parts match the legacy 12-part format', () => {
    it('should report no error', () => {
      // Arrange
      const rawParts = Array.from({length: 12}, (_, index) => `part${index}`);

      // Act
      const errors = verifySectionCount(rawParts);

      // Assert
      expect(errors).toEqual([]);
    });
  });

  describe('When the raw parts match neither the current nor the legacy format', () => {
    it('should report the expected and actual section counts', () => {
      // Arrange
      const rawParts = ['part0', 'part1'];

      // Act
      const errors = verifySectionCount(rawParts);

      // Assert
      expect(errors).toEqual(['INVALID: Expected 11 sections but found 2']);
    });
  });
});
