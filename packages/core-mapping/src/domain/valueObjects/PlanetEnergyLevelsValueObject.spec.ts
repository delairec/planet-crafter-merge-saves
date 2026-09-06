import {describe, expect, it} from 'bun:test';
import {createPlanetEnergyLevelsValueObject} from './PlanetEnergyLevelsValueObject.ts';
import {InvalidSaveDataError} from '../errors/InvalidSaveDataError.ts';

describe('PlanetEnergyLevelsValueObject', () => {
  it('should build a planet energy levels value object from valid data', () => {
    // Arrange
    const input = {
      planetId: 1,
      planetName: 'Toxicity',
      production: 100,
      consumption: 40,
      available: 60,
      productionBreakdown: [],
      consumptionBreakdown: [],
      optimizers: []
    };

    // Act
    const planetEnergyLevels = createPlanetEnergyLevelsValueObject(input);

    // Assert
    expect(planetEnergyLevels).toEqual(input);
  });

  it('should reject a non-finite available level', () => {
    // Arrange
    const input = {
      planetId: 1,
      production: 100,
      consumption: 40,
      available: NaN,
      productionBreakdown: [],
      consumptionBreakdown: [],
      optimizers: []
    };

    // Act & Assert
    expect(() => createPlanetEnergyLevelsValueObject(input)).toThrow(InvalidSaveDataError);
  });
});
