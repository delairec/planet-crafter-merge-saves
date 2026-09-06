import {describe, expect, it} from 'bun:test';
import {createInventoryEntity} from './InventoryEntity.ts';
import {InvalidSaveDataError} from '../errors/InvalidSaveDataError.ts';

describe('InventoryEntity', () => {
  it('should build an inventory entity from valid data', () => {
    // Arrange
    const input = {id: 42, worldObjectIds: ['1', '2'], size: 10};

    // Act
    const inventory = createInventoryEntity(input);

    // Assert
    expect(inventory).toEqual(input);
  });

  it('should reject a non-finite size', () => {
    // Arrange
    const input = {id: 42, worldObjectIds: ['1', '2'], size: NaN};

    // Act & Assert
    expect(() => createInventoryEntity(input)).toThrow(InvalidSaveDataError);
  });
});
