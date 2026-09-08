import {describe, expect, it} from 'bun:test';
import {createEnergyLevelsValueObject, EnergyLevelsValueObject} from './EnergyLevelsValueObject';
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
    const input: EnergyLevelsValueObject = {
      // @ts-expect-error a `planets` field holding no array at all is the invalid save data under test
      planets: undefined
    };

    // Act & Assert
    expect(() => createEnergyLevelsValueObject(input)).toThrow(InvalidSaveDataError);
  });
});
