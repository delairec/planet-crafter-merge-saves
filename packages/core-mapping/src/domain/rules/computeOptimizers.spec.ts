import {describe, expect, it} from 'bun:test';
import {computeOptimizers} from './computeOptimizers';
import {PlacedWorldObjectEntity} from '../entities/PlacedWorldObjectEntity';
import {WorldObjectEntity} from '../entities/WorldObjectEntity';
import {InventoryEntity} from '../entities/InventoryEntity';
import {WorldObjectName} from '../worldObjectNames';

describe('computeOptimizers', () => {
  describe('When an optimizer holds one fuse and boosts one producer', () => {
    it('should report the boosted machine and the extra production it contributes', () => {
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
      const result = computeOptimizers(allWorldObjects, [optimizer, producer], inventories);

      // Assert
      expect(result).toEqual([{
        name: 'Optimizer1',
        fuseCount: 1,
        boostedMachines: [{name: 'EnergyGenerator1', quantity: 1}],
        contribution: 1.2 * (1.5 - 1)
      }]);
    });
  });

  describe('When an optimizer holds a fuse but boosts no producer', () => {
    it('should report zero contribution and no boosted machines', () => {
      // Arrange
      const optimizer: PlacedWorldObjectEntity = {
        id: 'opt-1', name: 'Optimizer1' as WorldObjectName, position: [0, 0, 0], planetId: 1, inventoryId: 99
      };
      const fuse: WorldObjectEntity = {id: 'fuse-1', name: 'FuseEnergy1' as WorldObjectName};
      const allWorldObjects: WorldObjectEntity[] = [optimizer, fuse];
      const inventories: InventoryEntity[] = [{id: 99, worldObjectIds: ['fuse-1'], size: 1}];

      // Act
      const result = computeOptimizers(allWorldObjects, [optimizer], inventories);

      // Assert
      expect(result).toEqual([{name: 'Optimizer1', fuseCount: 1, boostedMachines: [], contribution: 0}]);
    });
  });

  describe('When a producer is boosted by more than one optimizer', () => {
    it('should split the producer total boost between the optimizers proportionally to their fuse count', () => {
      // Arrange
      const optimizerA: PlacedWorldObjectEntity = {
        id: 'opt-a', name: 'Optimizer1' as WorldObjectName, position: [0, 0, 0], planetId: 1, inventoryId: 99
      };
      const optimizerB: PlacedWorldObjectEntity = {
        id: 'opt-b', name: 'Optimizer1' as WorldObjectName, position: [2, 0, 0], planetId: 1, inventoryId: 98
      };
      const producer: PlacedWorldObjectEntity = {
        id: 'prod-1', name: 'EnergyGenerator1' as WorldObjectName, position: [1, 0, 0], planetId: 1
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
      const result = computeOptimizers(
        allWorldObjects,
        [optimizerA, optimizerB, producer],
        inventories
      );

      // Assert: total fuse count on the producer is 3 (1 + 2), so its total boost of
      // 1.2 * (3 * 1.5 - 1) = 4.2 is split 1/3 to optimizerA and 2/3 to optimizerB
      expect(result.map(entry => entry.contribution)).toEqual([1.4, 2.8]);
    });
  });
});
