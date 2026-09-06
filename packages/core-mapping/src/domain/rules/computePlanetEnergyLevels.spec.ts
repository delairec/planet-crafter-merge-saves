import {describe, expect, it} from 'bun:test';
import {computePlanetEnergyLevels} from './computePlanetEnergyLevels';
import {PlacedWorldObjectEntity} from '../entities/PlacedWorldObjectEntity';
import {WorldObjectEntity} from '../entities/WorldObjectEntity';
import {InventoryEntity} from '../entities/InventoryEntity';
import {WorldObjectName} from '../worldObjectNames';

describe('computePlanetEnergyLevels', () => {
  it('should report available energy as production minus consumption', () => {
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

  it('should express each production breakdown entry as a share of the total production', () => {
    // Arrange
    const worldObjects: PlacedWorldObjectEntity[] = [
      {id: '1', name: 'EnergyGenerator2' as WorldObjectName, position: [0, 0, 0], planetId: 1},
      {id: '2', name: 'EnergyGenerator3' as WorldObjectName, position: [0, 10, 0], planetId: 1}
    ];

    const noInventories: InventoryEntity[] = [];

    // Act
    const result = computePlanetEnergyLevels(worldObjects, worldObjects, noInventories);

    // Assert
    expect(result.production).toBe(26);
    expect(result.productionBreakdown).toEqual([
      {name: 'EnergyGenerator3', quantity: 1, unitLevel: 19.5, totalLevel: 19.5, productionRatio: 0.75},
      {name: 'EnergyGenerator2', quantity: 1, unitLevel: 6.5, totalLevel: 6.5, productionRatio: 0.25}
    ]);
  });

  it('should express each optimizer contribution as a share of the total production', () => {
    // Arrange
    const optimizerInventoryId = 99;
    const optimizer: PlacedWorldObjectEntity = {
      id: 'opt-1', name: 'Optimizer1' as WorldObjectName, position: [0, 0, 0], planetId: 1, inventoryId: optimizerInventoryId
    };
    const boostedProducer: PlacedWorldObjectEntity = {
      id: 'prod-1', name: 'WindTurbine1' as WorldObjectName, position: [10, 0, 0], planetId: 1
    };
    const producerOutOfOptimizerRadius: PlacedWorldObjectEntity = {
      id: 'prod-2', name: 'WindTurbine1' as WorldObjectName, position: [200, 0, 0], planetId: 1
    };
    const energyFuse: WorldObjectEntity = {id: 'fuse-1', name: 'FuseEnergy1' as WorldObjectName};
    const allWorldObjects: WorldObjectEntity[] = [optimizer, boostedProducer, producerOutOfOptimizerRadius, energyFuse];
    const optimizerInventoryHoldingOneFuse: InventoryEntity[] = [
      {id: optimizerInventoryId, worldObjectIds: [energyFuse.id], size: 1}
    ];

    // Act
    const result = computePlanetEnergyLevels(
      allWorldObjects,
      [optimizer, boostedProducer, producerOutOfOptimizerRadius],
      optimizerInventoryHoldingOneFuse
    );

    // Assert
    expect(result.production).toBe(725);
    expect(result.optimizers).toEqual([{
      name: 'Optimizer1',
      fuseCount: 1,
      boostedMachines: [{name: 'WindTurbine1', quantity: 1}],
      contribution: 145,
      productionRatio: 0.2
    }]);
  });

  it('should leave production shares undefined when the planet produces no energy', () => {
    // Arrange
    const optimizer: PlacedWorldObjectEntity = {
      id: 'opt-1', name: 'Optimizer1' as WorldObjectName, position: [0, 0, 0], planetId: 1, inventoryId: 99
    };
    const fuse: WorldObjectEntity = {id: 'fuse-1', name: 'FuseEnergy1' as WorldObjectName};
    const allWorldObjects: WorldObjectEntity[] = [optimizer, fuse];
    const inventories: InventoryEntity[] = [{id: 99, worldObjectIds: ['fuse-1'], size: 1}];

    // Act
    const result = computePlanetEnergyLevels(allWorldObjects, [optimizer], inventories);

    // Assert
    expect(result.production).toBe(0);
    expect(result.optimizers).toEqual([{
      name: 'Optimizer1',
      fuseCount: 1,
      boostedMachines: [],
      contribution: 0,
      productionRatio: undefined
    }]);
  });

  it('should ignore world objects placed on another planet, each planet having its own power grid', () => {
    // Arrange
    const producerOnThisPlanet: PlacedWorldObjectEntity = {
      id: '1', name: 'EnergyGenerator1' as WorldObjectName, position: [0, 0, 0], planetId: 1
    };
    const producerOnAnotherPlanet: PlacedWorldObjectEntity = {
      id: '2', name: 'EnergyGenerator6' as WorldObjectName, position: [0, 0, 0], planetId: 2
    };
    const consumerOnAnotherPlanet: PlacedWorldObjectEntity = {
      id: '3', name: 'Drill4' as WorldObjectName, position: [10, 0, 0], planetId: 2
    };
    const allWorldObjects: WorldObjectEntity[] = [
      producerOnThisPlanet, producerOnAnotherPlanet, consumerOnAnotherPlanet
    ];
    const noInventories: InventoryEntity[] = [];

    // Act
    const result = computePlanetEnergyLevels(allWorldObjects, [producerOnThisPlanet], noInventories);

    // Assert
    expect(result.production).toBe(1.2);
    expect(result.consumption).toBe(0);
    expect(result.available).toBe(1.2);
  });
});
