import {describe, expect, it} from 'bun:test';
import {createStatisticsValueObject} from './StatisticsValueObject';
import {InvalidSaveDataError} from '../errors/InvalidSaveDataError';

describe('StatisticsValueObject', () => {
  it('should build a statistics value object from valid data', () => {
    // Arrange
    const input = {totalCraftedObjects: 10};

    // Act
    const statistics = createStatisticsValueObject(input);

    // Assert
    expect(statistics).toEqual(input);
  });

  it('should reject a non-finite total crafted objects count', () => {
    // Arrange
    const input = {totalCraftedObjects: NaN};

    // Act & Assert
    expect(() => createStatisticsValueObject(input)).toThrow(InvalidSaveDataError);
  });
});
