import {describe, expect, it} from 'bun:test';
import {computeEnergyFuseCountsByProducerId} from './computeEnergyFuseCountsByProducerId';
import {PlacedWorldObjectEntity} from '../entities/PlacedWorldObjectEntity';
import {WorldObjectEntity} from '../entities/WorldObjectEntity';
import {InventoryEntity} from '../entities/InventoryEntity';
import {WorldObjectName} from '../worldObjectNames';

describe('computeEnergyFuseCountsByProducerId', () => {
  const producer: PlacedWorldObjectEntity = {
    id: 'prod-1', name: 'EnergyGenerator1' as WorldObjectName, position: [1, 0, 0], planetId: 1
  };

  describe('When a producer is boosted by a single optimizer', () => {
    it('should map the producer id to that optimizer fuse count', () => {
      // Arrange
      const optimizer: PlacedWorldObjectEntity = {
        id: 'opt-1', name: 'Optimizer1' as WorldObjectName, position: [0, 0, 0], planetId: 1, inventoryId: 99
      };
      const fuse: WorldObjectEntity = {id: 'fuse-1', name: 'FuseEnergy1' as WorldObjectName};
      const allWorldObjects: WorldObjectEntity[] = [optimizer, producer, fuse];
      const inventories: InventoryEntity[] = [{id: 99, worldObjectIds: ['fuse-1'], size: 1}];

      // Act
      const result = computeEnergyFuseCountsByProducerId(allWorldObjects, [optimizer, producer], inventories);

      // Assert
      expect(result).toEqual(new Map([['prod-1', 1]]));
    });
  });

  describe('When a producer is boosted by more than one optimizer', () => {
    it('should sum the fuse counts of every optimizer boosting it', () => {
      // Arrange
      const optimizerA: PlacedWorldObjectEntity = {
        id: 'opt-a', name: 'Optimizer1' as WorldObjectName, position: [0, 0, 0], planetId: 1, inventoryId: 99
      };
      const optimizerB: PlacedWorldObjectEntity = {
        id: 'opt-b', name: 'Optimizer1' as WorldObjectName, position: [2, 0, 0], planetId: 1, inventoryId: 98
      };
      const fuseA: WorldObjectEntity = {id: 'fuse-a', name: 'FuseEnergy1' as WorldObjectName};
      const fuseB1: WorldObjectEntity = {id: 'fuse-b1', name: 'FuseEnergy1' as WorldObjectName};
      const fuseB2: WorldObjectEntity = {id: 'fuse-b2', name: 'FuseEnergy1' as WorldObjectName};
      const allWorldObjects: WorldObjectEntity[] = [optimizerA, optimizerB, producer, fuseA, fuseB1, fuseB2];
      const inventories: InventoryEntity[] = [
        {id: 99, worldObjectIds: ['fuse-a'], size: 1},
        {id: 98, worldObjectIds: ['fuse-b1', 'fuse-b2'], size: 2}
      ];

      // Act
      const result = computeEnergyFuseCountsByProducerId(
        allWorldObjects,
        [optimizerA, optimizerB, producer],
        inventories
      );

      // Assert
      expect(result).toEqual(new Map([['prod-1', 3]]));
    });
  });

  describe('When no producer is boosted by any optimizer', () => {
    it('should return an empty map', () => {
      // Act
      const result = computeEnergyFuseCountsByProducerId([producer], [producer], []);

      // Assert
      expect(result).toEqual(new Map());
    });
  });
});
