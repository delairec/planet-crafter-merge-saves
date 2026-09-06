import {describe, expect, it} from 'bun:test';
import {computeEnergyProductionLevel} from './computeEnergyProductionLevel';
import {PlacedWorldObjectEntity} from '../entities/PlacedWorldObjectEntity';
import {WorldObjectEntity} from '../entities/WorldObjectEntity';
import {InventoryEntity} from '../entities/InventoryEntity';
import {WorldObjectName} from '../worldObjectNames';
import {energyProductionLevelsByWorldObjectName} from '../energyLevelsByWorldObjectName';

describe('computeEnergyProductionLevel', () => {
  it('should sum the base production of positioned world objects with known production levels', () => {
    // Arrange
    const worldObjects: PlacedWorldObjectEntity[] = [
      {id: '1', name: 'EnergyGenerator1' as WorldObjectName, position: [0, 0, 0], planetId: 1},
      {id: '2', name: 'EnergyGenerator2' as WorldObjectName, position: [1, 0, 0], planetId: 1}
    ];

    // Act
    const result = computeEnergyProductionLevel(worldObjects, worldObjects, []);

    // Assert
    expect(result).toBe(1.2 + 6.5);
  });

  it('should ignore world objects with no known production level', () => {
    // Arrange
    const worldObjects: PlacedWorldObjectEntity[] = [
      {id: '1', name: 'EnergyGenerator1' as WorldObjectName, position: [0, 0, 0], planetId: 1},
      {id: '2', name: 'Drill0' as WorldObjectName, position: [1, 0, 0], planetId: 1}
    ];

    // Act
    const result = computeEnergyProductionLevel(worldObjects, worldObjects, []);

    // Assert
    expect(result).toBe(1.2);
  });

  it('should apply the energy fuse multiplier to a producer boosted by an optimizer', () => {
    // Arrange
    const optimizer: PlacedWorldObjectEntity = {
      id: 'opt-1', name: 'Optimizer1' as WorldObjectName, position: [0, 0, 0], planetId: 1, inventoryId: 99
    };
    const producer: PlacedWorldObjectEntity = {
      id: 'prod-1', name: 'EnergyGenerator2' as WorldObjectName, position: [1, 0, 0], planetId: 1
    };
    const fuse: WorldObjectEntity = {id: 'fuse-1', name: 'FuseEnergy1' as WorldObjectName};
    const allWorldObjects: WorldObjectEntity[] = [optimizer, producer, fuse];
    const inventories: InventoryEntity[] = [{id: 99, worldObjectIds: ['fuse-1'], size: 1}];

    // Act
    const result = computeEnergyProductionLevel(allWorldObjects, [optimizer, producer], inventories);

    // Assert
    const oneAndAHalfTimesTheProducerBaseLevel = 9.75;
    expect(result).toBe(oneAndAHalfTimesTheProducerBaseLevel);
  });

  it('should stack several energy fuses held by the same optimizer (Rule EN-FUSE-3)', () => {
    // Arrange
    const optimizerInventoryId = 99;
    const tierTwoOptimizer: PlacedWorldObjectEntity = {
      id: 'opt-1', name: 'Optimizer2' as WorldObjectName, position: [0, 0, 0], planetId: 1, inventoryId: optimizerInventoryId
    };
    const boostedProducer: PlacedWorldObjectEntity = {
      id: 'prod-1', name: 'EnergyGenerator2' as WorldObjectName, position: [10, 0, 0], planetId: 1
    };
    const firstEnergyFuse: WorldObjectEntity = {id: 'fuse-1', name: 'FuseEnergy1' as WorldObjectName};
    const secondEnergyFuse: WorldObjectEntity = {id: 'fuse-2', name: 'FuseEnergy1' as WorldObjectName};
    const allWorldObjects: WorldObjectEntity[] = [tierTwoOptimizer, boostedProducer, firstEnergyFuse, secondEnergyFuse];
    const optimizerInventoryHoldingBothFuses: InventoryEntity[] = [
      {id: optimizerInventoryId, worldObjectIds: [firstEnergyFuse.id, secondEnergyFuse.id], size: 3}
    ];

    // Act
    const productionLevel = computeEnergyProductionLevel(
      allWorldObjects,
      [tierTwoOptimizer, boostedProducer],
      optimizerInventoryHoldingBothFuses
    );

    // Assert
    const threeTimesTheProducerBaseLevel = 19.5;
    expect(productionLevel).toBe(threeTimesTheProducerBaseLevel);
  });

  const producerNames = Object.keys(energyProductionLevelsByWorldObjectName) as WorldObjectName[];

  it.each(producerNames)('should recognize %s as a producer (Rule EN-BASE-2)', (name) => {
    // Arrange
    const producer: PlacedWorldObjectEntity = {id: name, name, position: [0, 0, 0], planetId: 1};
    const noInventories: InventoryEntity[] = [];

    // Act
    const productionLevel = computeEnergyProductionLevel([producer], [producer], noInventories);

    // Assert
    expect(productionLevel).toBeGreaterThan(0);
  });

  it('should return zero for an empty list of positioned world objects', () => {
    // Act
    const result = computeEnergyProductionLevel([], [], []);

    // Assert
    expect(result).toBe(0);
  });
});
