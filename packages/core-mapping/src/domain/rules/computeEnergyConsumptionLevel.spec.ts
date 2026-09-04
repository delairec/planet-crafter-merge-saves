import {describe, expect, it} from 'bun:test';
import {computeEnergyConsumptionLevel} from './computeEnergyConsumptionLevel';
import {PlacedWorldObjectEntity} from '../entities/PlacedWorldObjectEntity';
import {WorldObjectName} from '../worldObjectNames';

describe('computeEnergyConsumptionLevel', () => {
  it('should sum the consumption of positioned world objects with known consumption levels', () => {
    // Arrange
    const worldObjects: PlacedWorldObjectEntity[] = [
      {id: '1', name: 'Drill0' as WorldObjectName, position: [0, 0, 0], planetId: 1},
      {id: '2', name: 'Heater1' as WorldObjectName, position: [1, 0, 0], planetId: 1}
    ];

    // Act
    const result = computeEnergyConsumptionLevel(worldObjects);

    // Assert
    expect(result).toBe(1.5);
  });

  it('should ignore world objects with no known consumption level', () => {
    // Arrange
    const worldObjects: PlacedWorldObjectEntity[] = [
      {id: '1', name: 'Drill0' as WorldObjectName, position: [0, 0, 0], planetId: 1},
      {id: '2', name: 'EnergyGenerator1' as WorldObjectName, position: [1, 0, 0], planetId: 1}
    ];

    // Act
    const result = computeEnergyConsumptionLevel(worldObjects);

    // Assert
    expect(result).toBe(0.5);
  });

  it('should return zero for an empty list of world objects', () => {
    // Arrange
    const worldObjects: PlacedWorldObjectEntity[] = [];

    // Act
    const result = computeEnergyConsumptionLevel(worldObjects);

    // Assert
    expect(result).toBe(0);
  });
});
