import {describe, expect, it} from 'bun:test';
import {computePlanetEnergyLevels} from './computePlanetEnergyLevels';
import {PlacedWorldObjectEntity} from '../entities/PlacedWorldObjectEntity';
import {WorldObjectEntity} from '../entities/WorldObjectEntity';
import {InventoryEntity} from '../entities/InventoryEntity';
import {WorldObjectName} from '../worldObjectNames';

describe('computePlanetEnergyLevels', () => {
  it('should sum production and consumption of positioned world objects', () => {
    // Arrange
    const worldObjects: PlacedWorldObjectEntity[] = [
      {id: '1', name: 'EnergyGenerator1' as WorldObjectName, position: [0, 0, 0], planetId: 1},
      {id: '2', name: 'Drill0' as WorldObjectName, position: [0, 10, 0], planetId: 1}
    ];

    // Act
    const result = computePlanetEnergyLevels(worldObjects, worldObjects, []);

    // Assert
    expect(result.production).toBe(1.2);
    expect(result.consumption).toBe(0.5);
    expect(result.available).toBe(0.7);
  });

  it('should apply the Energy Fuse multiplier to producers boosted by an Optimizer', () => {
    // Arrange
    const optimizer: PlacedWorldObjectEntity = {
      id: 'opt-1', name: 'Optimizer1' as WorldObjectName, position: [0, 0, 0], planetId: 1, inventoryId: 99
    };
    const producer: PlacedWorldObjectEntity = {
      id: 'prod-1', name: 'EnergyGenerator1' as WorldObjectName, position: [1, 0, 0], planetId: 1
    };
    const fuse: WorldObjectEntity = {id: 'fuse-1', name: 'FuseEnergy1' as WorldObjectName};
    const allWorldObjects: WorldObjectEntity[] = [optimizer, producer, fuse];
    const inventories: InventoryEntity[] = [{id: 99, worldObjectIds: ['fuse-1'], size: 1}];

    // Act
    const result = computePlanetEnergyLevels(allWorldObjects, [optimizer, producer], inventories);

    // Assert
    expect(result.production).toBe(1.2 * 1.5);
    expect(result.optimizers).toEqual([{
      name: expect.any(String),
      fuseCount: 1,
      boostedMachines: [{name: expect.any(String), quantity: 1}],
      contribution: 1.2 * (1.5 - 1)
    }]);
  });

  it('should not boost producers on a different planet than the Optimizer', () => {
    // Arrange
    const optimizer: PlacedWorldObjectEntity = {
      id: 'opt-1', name: 'Optimizer1' as WorldObjectName, position: [0, 0, 0], planetId: 1, inventoryId: 99
    };
    const producerOnOtherPlanet: PlacedWorldObjectEntity = {
      id: 'prod-1', name: 'EnergyGenerator1' as WorldObjectName, position: [1, 0, 0], planetId: 2
    };
    const fuse: WorldObjectEntity = {id: 'fuse-1', name: 'FuseEnergy1' as WorldObjectName};
    const allWorldObjects: WorldObjectEntity[] = [optimizer, producerOnOtherPlanet, fuse];
    const inventories: InventoryEntity[] = [{id: 99, worldObjectIds: ['fuse-1'], size: 1}];

    // Act
    const result = computePlanetEnergyLevels(allWorldObjects, [optimizer], inventories);

    // Assert: the Optimizer still appears (it holds a fuse) but boosts nothing on this planet
    expect(result.optimizers).toEqual([{
      name: expect.any(String),
      fuseCount: 1,
      boostedMachines: [],
      contribution: 0
    }]);
  });
});
