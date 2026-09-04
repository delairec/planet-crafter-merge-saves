import {describe, expect, it} from 'bun:test';
import {createEnergyLevelsRawDataValueObject, createPlanetWorldObjectsValueObject} from './EnergyLevelsRawDataValueObject';
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
    const input = {allWorldObjects: [], inventories: [], planets: undefined as unknown as []};

    // Act & Assert
    expect(() => createEnergyLevelsRawDataValueObject(input)).toThrow(InvalidSaveDataError);
  });
});
