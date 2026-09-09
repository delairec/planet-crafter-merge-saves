import {describe, expect, it} from 'bun:test';
import {buildMergedFileName} from './buildMergedFileName';

describe('buildMergedFileName', () => {

  describe('When both file names carry a .json extension', () => {
    it('should combine both file names, stripping their extension', () => {
      // Arrange
      const fileNameA = 'Standard-1.json';
      const fileNameB = 'Standard-2.json';

      // Act
      const result = buildMergedFileName(fileNameA, fileNameB);

      // Assert
      expect(result).toBe('Standard-1-Standard-2-merged.json');
    });
  });

  describe('When the file names have no .json extension', () => {
    it('should combine both file names as they are', () => {
      // Arrange
      const fileNameA = 'Standard-1';
      const fileNameB = 'Standard-2';

      // Act
      const result = buildMergedFileName(fileNameA, fileNameB);

      // Assert
      expect(result).toBe('Standard-1-Standard-2-merged.json');
    });
  });

  describe('When a file name holds path separators or unsafe characters', () => {
    it('should remove them from the merged file name', () => {
      // Arrange
      const fileNameA = '../malicious/<script>';
      const fileNameB = 'safe.JSON';

      // Act
      const result = buildMergedFileName(fileNameA, fileNameB);

      // Assert
      expect(result).toBe('_malicious__script_-safe-merged.json');
    });
  });
});
