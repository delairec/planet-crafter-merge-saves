import {describe, expect, it} from 'bun:test';
import {createEnergyBreakdownEntryValueObject} from './EnergyBreakdownEntryValueObject';
import {InvalidSaveDataError} from '../errors/InvalidSaveDataError';

describe('EnergyBreakdownEntryValueObject', () => {
  it('should build an energy breakdown entry from valid data', () => {
    // Arrange
    const input = {name: 'Drill0' as const, quantity: 2, unitLevel: 10, totalLevel: 20, productionRatio: 0.5};

    // Act
    const entry = createEnergyBreakdownEntryValueObject(input);

    // Assert
    expect(entry).toEqual(input);
  });

  it('should reject a non-finite total level', () => {
    // Arrange
    const input = {name: 'Drill0' as const, quantity: 2, unitLevel: 10, totalLevel: NaN};

    // Act & Assert
    expect(() => createEnergyBreakdownEntryValueObject(input)).toThrow(InvalidSaveDataError);
  });
});
