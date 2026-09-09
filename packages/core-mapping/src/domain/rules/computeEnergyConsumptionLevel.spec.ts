import {describe, expect, it} from 'bun:test';
import {computeEnergyConsumptionLevel} from './computeEnergyConsumptionLevel';
import {PlacedWorldObjectEntity} from '../entities/PlacedWorldObjectEntity';
import {WorldObjectName, worldObjectNamesByEnergyRole} from '../worldObjectNames';

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

  // `worldObjectNames.ts` partitions every known `gId` into producing / consuming / no known energy
  // level, so these two guards fail when a table entry is removed and when a name is priced without
  // being moved into its group. What they do and do not prove of Rule EN-BASE-2 is in
  // docs/energy-levels.md, "What the versioned guard covers".
  const {consuming, withoutKnownEnergyLevel} = worldObjectNamesByEnergyRole;

  const placedAlone = (name: WorldObjectName): PlacedWorldObjectEntity[] => [
    {id: name, name, position: [0, 0, 0], planetId: 1}
  ];

  it.each([...consuming])('should charge %s, a world object grouped as an energy consumer', (name) => {
    // Act
    const consumptionLevel = computeEnergyConsumptionLevel(placedAlone(name));

    // Assert
    expect(consumptionLevel).toBeGreaterThan(0);
  });

  it('should charge nothing for the world objects without a known energy level', () => {
    // Act
    const charged = withoutKnownEnergyLevel.filter((name) => computeEnergyConsumptionLevel(placedAlone(name)) > 0);

    // Assert
    expect(charged).toEqual([]);
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
