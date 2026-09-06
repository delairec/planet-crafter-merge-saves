import {describe, expect, it} from 'bun:test';
import {createPlacedWorldObjectEntity} from './PlacedWorldObjectEntity.ts';
import {InvalidSaveDataError} from '../errors/InvalidSaveDataError.ts';

describe('PlacedWorldObjectEntity', () => {
  it('should build a placed world object entity from valid data', () => {
    // Arrange
    const input = {id: '1', name: 'Drill0' as const, position: [1, 2, 3] as [number, number, number], planetId: 1, inventoryId: 5};

    // Act
    const placedWorldObject = createPlacedWorldObjectEntity(input);

    // Assert
    expect(placedWorldObject).toEqual(input);
  });

  it('should reject a position containing NaN', () => {
    // Arrange
    const input = {id: '1', name: 'Drill0' as const, position: [NaN, 2, 3] as [number, number, number], planetId: 1};

    // Act & Assert
    expect(() => createPlacedWorldObjectEntity(input)).toThrow(InvalidSaveDataError);
  });
});
