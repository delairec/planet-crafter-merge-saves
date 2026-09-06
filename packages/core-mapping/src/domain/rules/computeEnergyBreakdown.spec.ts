import {describe, expect, it} from 'bun:test';
import {computeEnergyBreakdown} from './computeEnergyBreakdown.ts';
import type {PlacedWorldObjectEntity} from '../entities/PlacedWorldObjectEntity.ts';
import type {WorldObjectName} from '../worldObjectNames.ts';

describe('computeEnergyBreakdown', () => {
  it('should group positioned world objects by name and compute their quantity and total level', () => {
    // Arrange
    const worldObjects: PlacedWorldObjectEntity[] = [
      {id: '1', name: 'EnergyGenerator1' as WorldObjectName, position: [0, 0, 0], planetId: 1},
      {id: '2', name: 'EnergyGenerator1' as WorldObjectName, position: [1, 0, 0], planetId: 1}
    ];
    const levelsByWorldObjectName = {EnergyGenerator1: 10};

    // Act
    const result = computeEnergyBreakdown(worldObjects, levelsByWorldObjectName);

    // Assert
    expect(result).toEqual([{name: 'EnergyGenerator1', quantity: 2, unitLevel: 10, totalLevel: 20}]);
  });

  it('should ignore world objects that are not present in the levels table', () => {
    // Arrange
    const worldObjects: PlacedWorldObjectEntity[] = [
      {id: '1', name: 'EnergyGenerator1' as WorldObjectName, position: [0, 0, 0], planetId: 1},
      {id: '2', name: 'Drill0' as WorldObjectName, position: [1, 0, 0], planetId: 1}
    ];
    const levelsByWorldObjectName = {EnergyGenerator1: 10};

    // Act
    const result = computeEnergyBreakdown(worldObjects, levelsByWorldObjectName);

    // Assert
    expect(result).toEqual([{name: 'EnergyGenerator1', quantity: 1, unitLevel: 10, totalLevel: 10}]);
  });

  it('should sort entries by total level descending', () => {
    // Arrange
    const worldObjects: PlacedWorldObjectEntity[] = [
      {id: '1', name: 'EnergyGenerator1' as WorldObjectName, position: [0, 0, 0], planetId: 1},
      {id: '2', name: 'EnergyGenerator2' as WorldObjectName, position: [1, 0, 0], planetId: 1}
    ];
    const levelsByWorldObjectName = {EnergyGenerator1: 5, EnergyGenerator2: 50};

    // Act
    const result = computeEnergyBreakdown(worldObjects, levelsByWorldObjectName);

    // Assert
    expect(result.map(entry => entry.name)).toEqual(['EnergyGenerator2', 'EnergyGenerator1']);
  });
});
