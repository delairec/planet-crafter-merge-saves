import {describe, it, expect} from 'bun:test';
import {buildMergedFileName} from './buildMergedFileName.js';

describe('buildMergedFileName', () => {

  it('should combine both file names, stripping their .json extension', () => {
    // Arrange
    const fileNameA = 'Standard-1.json';
    const fileNameB = 'Standard-2.json';

    // Act
    const result = buildMergedFileName(fileNameA, fileNameB);

    // Assert
    expect(result).toBe('Standard-1-Standard-2-merged.json');
  });

  it('should combine both file names as-is when they have no .json extension', () => {
    // Arrange
    const fileNameA = 'Standard-1';
    const fileNameB = 'Standard-2';

    // Act
    const result = buildMergedFileName(fileNameA, fileNameB);

    // Assert
    expect(result).toBe('Standard-1-Standard-2-merged.json');
  });
});
