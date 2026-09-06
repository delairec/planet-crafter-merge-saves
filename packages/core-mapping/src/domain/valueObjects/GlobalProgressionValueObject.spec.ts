import {describe, expect, it} from 'bun:test';
import {createGlobalProgressionValueObject} from './GlobalProgressionValueObject.ts';
import {InvalidSaveDataError} from '../errors/InvalidSaveDataError.ts';

describe('GlobalProgressionValueObject', () => {
  it('should build a global progression value object from valid data', () => {
    // Arrange
    const input = {allTimeTerraTokens: 200_345};

    // Act
    const globalProgression = createGlobalProgressionValueObject(input);

    // Assert
    expect(globalProgression).toEqual(input);
  });

  it('should reject a non-finite terra tokens count', () => {
    // Arrange
    const input = {allTimeTerraTokens: NaN};

    // Act & Assert
    expect(() => createGlobalProgressionValueObject(input)).toThrow(InvalidSaveDataError);
  });
});
