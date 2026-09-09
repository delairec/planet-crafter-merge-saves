import {describe, expect, it} from 'bun:test';
import {
  createEnergyLevelsRawDataValueObject,
  createPlanetWorldObjectsValueObject,
  EnergyLevelsRawDataValueObject
} from './EnergyLevelsRawDataValueObject';
import {InvalidSaveDataError} from '../errors/InvalidSaveDataError';

describe('PlanetWorldObjectsValueObject', () => {
  it('should build a planet world objects value object from valid data', () => {
    // Arrange
    const input = {planetId: 1, planetName: 'Toxicity', placedWorldObjects: []};

    // Act
    const planet = createPlanetWorldObjectsValueObject(input);

    // Assert
    expect(planet).toEqual(input);
  });

  it('should reject a non-finite planet id', () => {
    // Arrange
    const input = {planetId: NaN, placedWorldObjects: []};

    // Act & Assert
    expect(() => createPlanetWorldObjectsValueObject(input)).toThrow(InvalidSaveDataError);
  });
});

describe('EnergyLevelsRawDataValueObject', () => {
  it('should build an energy levels raw data value object from valid data', () => {
    // Arrange
    const input = {allWorldObjects: [], inventories: [], planets: []};

    // Act
    const rawData = createEnergyLevelsRawDataValueObject(input);

    // Assert
    expect(rawData).toEqual(input);
  });

  it('should reject a non-array planets field', () => {
    // Arrange
    const input: EnergyLevelsRawDataValueObject = {
      allWorldObjects: [],
      inventories: [],
      // @ts-expect-error a `planets` field holding no array at all is the invalid save data under test
      planets: undefined
    };

    // Act & Assert
    expect(() => createEnergyLevelsRawDataValueObject(input)).toThrow(InvalidSaveDataError);
  });
});
