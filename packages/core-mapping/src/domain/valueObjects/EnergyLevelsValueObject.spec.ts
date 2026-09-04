import {describe, expect, it} from 'bun:test';
import {createEnergyLevelsValueObject} from './EnergyLevelsValueObject';
import {InvalidSaveDataError} from '../errors/InvalidSaveDataError';

describe('EnergyLevelsValueObject', () => {
  it('should build an energy levels value object from valid data', () => {
    // Arrange
    const input = {planets: []};

    // Act
    const energyLevels = createEnergyLevelsValueObject(input);

    // Assert
    expect(energyLevels).toEqual(input);
  });

  it('should reject a non-array planets field', () => {
    // Arrange
    const input = {planets: undefined as unknown as []};

    // Act & Assert
    expect(() => createEnergyLevelsValueObject(input)).toThrow(InvalidSaveDataError);
  });
});
