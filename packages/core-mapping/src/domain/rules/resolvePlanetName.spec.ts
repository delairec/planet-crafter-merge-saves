import {describe, expect, it} from 'bun:test';
import {resolvePlanetName} from './resolvePlanetName';

describe('resolvePlanetName', () => {
  describe('When the planet numeric id is in the known planets table (Rule EN-PLANET-3)', () => {
    it('should return the name of that table without looking at the world object names', () => {
      // Act
      const planetName = resolvePlanetName(-1140328421, [], []);

      // Assert
      expect(planetName).toBe('Prime');
    });
  });

  describe('When the planet numeric id is unknown and exactly one known planet name appears in a world object name (Rule EN-PLANET-2)', () => {
    it('should return that planet name', () => {
      // Act
      const planetName = resolvePlanetName(1, ['Seed7Humble', 'EnergyGenerator1'], ['Humble', 'Aqualis']);

      // Assert
      expect(planetName).toBe('Humble');
    });
  });

  describe('When the planet numeric id is unknown and no known planet name appears in a world object name', () => {
    it('should not resolve any planet name', () => {
      // Act
      const planetName = resolvePlanetName(1, ['EnergyGenerator1'], ['Humble', 'Aqualis']);

      // Assert
      expect(planetName).toBeUndefined();
    });
  });

  describe('When the planet numeric id is unknown and several known planet names appear in the world object names', () => {
    it('should not resolve any planet name, the hint being ambiguous', () => {
      // Act
      const planetName = resolvePlanetName(1, ['Seed7Humble', 'Seed7Aqualis'], ['Humble', 'Aqualis']);

      // Assert
      expect(planetName).toBeUndefined();
    });
  });
});
