import {describe, expect, it} from 'bun:test';
import {createMergedSaveValueObject} from './MergedSaveValueObject.ts';
import {InvalidSaveDataError} from '../errors/InvalidSaveDataError.ts';

describe('MergedSaveValueObject', () => {
  it('should build a merged save value object from valid data', () => {
    // Arrange
    const input = {fileName: 'merged.json', content: '{}'};

    // Act
    const mergedSave = createMergedSaveValueObject(input);

    // Assert
    expect(mergedSave).toEqual(input);
  });

  it('should reject an empty file name', () => {
    // Arrange
    const input = {fileName: '', content: '{}'};

    // Act & Assert
    expect(() => createMergedSaveValueObject(input)).toThrow(InvalidSaveDataError);
  });
});
