import {describe, expect, it} from 'bun:test';
import {resolvePlanetName} from './resolvePlanetName';

const PRIME_PLANET_NUMERIC_ID = -1140328421;
const UNKNOWN_PLANET_NUMERIC_ID = 1;

describe('resolvePlanetName', () => {
  describe('When the planet numeric id is in the known planets table (Rule EN-PLANET-3)', () => {
    it('should return the name of that table without looking at the world object names', () => {
      // Arrange
      const noWorldObjectNamesOnPlanet: string[] = [];
      const noTerraformedPlanetNames: string[] = [];

      // Act
      const planetName = resolvePlanetName(PRIME_PLANET_NUMERIC_ID, noWorldObjectNamesOnPlanet, noTerraformedPlanetNames);

      // Assert
      expect(planetName).toBe('Prime');
    });
  });

  describe('When the planet numeric id is unknown and exactly one known planet name appears in a world object name (Rule EN-PLANET-2)', () => {
    it('should return that planet name', () => {
      // Arrange
      const worldObjectNamesHintingAtHumble = ['Seed7Humble', 'EnergyGenerator1'];
      const terraformedPlanetNames = ['Humble', 'Aqualis'];

      // Act
      const planetName = resolvePlanetName(UNKNOWN_PLANET_NUMERIC_ID, worldObjectNamesHintingAtHumble, terraformedPlanetNames);

      // Assert
      expect(planetName).toBe('Humble');
    });
  });

  describe('When the planet numeric id is unknown and no known planet name appears in a world object name', () => {
    it('should not resolve any planet name', () => {
      // Arrange
      const worldObjectNamesWithoutPlanetHint = ['EnergyGenerator1'];
      const terraformedPlanetNames = ['Humble', 'Aqualis'];

      // Act
      const planetName = resolvePlanetName(UNKNOWN_PLANET_NUMERIC_ID, worldObjectNamesWithoutPlanetHint, terraformedPlanetNames);

      // Assert
      expect(planetName).toBeUndefined();
    });
  });

  describe('When the planet numeric id is unknown and several known planet names appear in the world object names', () => {
    it('should not resolve any planet name, the hint being ambiguous', () => {
      // Arrange
      const worldObjectNamesHintingAtTwoPlanets = ['Seed7Humble', 'Seed7Aqualis'];
      const terraformedPlanetNames = ['Humble', 'Aqualis'];

      // Act
      const planetName = resolvePlanetName(UNKNOWN_PLANET_NUMERIC_ID, worldObjectNamesHintingAtTwoPlanets, terraformedPlanetNames);

      // Assert
      expect(planetName).toBeUndefined();
    });
  });
});
