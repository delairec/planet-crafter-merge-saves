import {describe, expect, it} from 'bun:test';
import {computeOptimizerBoosts} from './computeOptimizerBoosts.ts';
import type {PlacedWorldObjectEntity} from '../entities/PlacedWorldObjectEntity.ts';
import type {WorldObjectEntity} from '../entities/WorldObjectEntity.ts';
import type {InventoryEntity} from '../entities/InventoryEntity.ts';
import type {WorldObjectName} from '../worldObjectNames.ts';

describe('computeOptimizerBoosts', () => {
  const optimizer: PlacedWorldObjectEntity = {
    id: 'opt-1', name: 'Optimizer1' as WorldObjectName, position: [0, 0, 0], planetId: 1, inventoryId: 99
  };
  const fuse: WorldObjectEntity = {id: 'fuse-1', name: 'FuseEnergy1' as WorldObjectName};

  describe('When an optimizer holds at least one energy fuse', () => {
    it('should report the optimizer with its fuse count and the producers it boosts', () => {
      // Arrange
      const producer: PlacedWorldObjectEntity = {
        id: 'prod-1', name: 'EnergyGenerator1' as WorldObjectName, position: [1, 0, 0], planetId: 1
      };
      const allWorldObjects: WorldObjectEntity[] = [optimizer, producer, fuse];
      const inventories: InventoryEntity[] = [{id: 99, worldObjectIds: ['fuse-1'], size: 1}];

      // Act
      const result = computeOptimizerBoosts(allWorldObjects, [optimizer, producer], inventories);

      // Assert
      expect(result).toEqual([{optimizer, fuseCount: 1, boostedProducers: [producer]}]);
    });
  });

  describe('When an optimizer holds no energy fuse', () => {
    it('should not report the optimizer at all', () => {
      // Arrange
      const producer: PlacedWorldObjectEntity = {
        id: 'prod-1', name: 'EnergyGenerator1' as WorldObjectName, position: [1, 0, 0], planetId: 1
      };
      const allWorldObjects: WorldObjectEntity[] = [optimizer, producer];
      const inventories: InventoryEntity[] = [{id: 99, worldObjectIds: [], size: 1}];

      // Act
      const result = computeOptimizerBoosts(allWorldObjects, [optimizer, producer], inventories);

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe('When the optimizer inventory cannot be found', () => {
    it('should not report the optimizer at all', () => {
      // Arrange
      const allWorldObjects: WorldObjectEntity[] = [optimizer, fuse];
      const inventories: InventoryEntity[] = [];

      // Act
      const result = computeOptimizerBoosts(allWorldObjects, [optimizer], inventories);

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe('When a producer is beyond the optimizer radius', () => {
    it('should exclude that producer from the boosted producers', () => {
      // Arrange
      const farProducer: PlacedWorldObjectEntity = {
        id: 'prod-1', name: 'EnergyGenerator1' as WorldObjectName, position: [200, 0, 0], planetId: 1
      };
      const allWorldObjects: WorldObjectEntity[] = [optimizer, farProducer, fuse];
      const inventories: InventoryEntity[] = [{id: 99, worldObjectIds: ['fuse-1'], size: 1}];

      // Act
      const result = computeOptimizerBoosts(allWorldObjects, [optimizer, farProducer], inventories);

      // Assert
      expect(result).toEqual([{optimizer, fuseCount: 1, boostedProducers: []}]);
    });
  });

  describe('When a producer is on a different planet than the optimizer', () => {
    it('should exclude that producer from the boosted producers', () => {
      // Arrange
      const producerOnOtherPlanet: PlacedWorldObjectEntity = {
        id: 'prod-1', name: 'EnergyGenerator1' as WorldObjectName, position: [1, 0, 0], planetId: 2
      };
      const allWorldObjects: WorldObjectEntity[] = [optimizer, producerOnOtherPlanet, fuse];
      const inventories: InventoryEntity[] = [{id: 99, worldObjectIds: ['fuse-1'], size: 1}];

      // Act
      const result = computeOptimizerBoosts(allWorldObjects, [optimizer, producerOnOtherPlanet], inventories);

      // Assert
      expect(result).toEqual([{optimizer, fuseCount: 1, boostedProducers: []}]);
    });
  });

  describe('When more eligible producers exist than the optimizer machine capacity', () => {
    it('should keep only the closest producers up to that capacity', () => {
      // Arrange
      const producers: PlacedWorldObjectEntity[] = Array.from({length: 6}, (_, index) => ({
        id: `prod-${index}`,
        name: 'EnergyGenerator1' as WorldObjectName,
        position: [index + 1, 0, 0],
        planetId: 1
      }));
      const allWorldObjects: WorldObjectEntity[] = [optimizer, ...producers, fuse];
      const inventories: InventoryEntity[] = [{id: 99, worldObjectIds: ['fuse-1'], size: 1}];

      // Act
      const result = computeOptimizerBoosts(allWorldObjects, [optimizer, ...producers], inventories);

      // Assert: Optimizer1 has a capacity of 5 machines, so the farthest (6th) producer is excluded
      expect(result[0].boostedProducers.map(p => p.id)).toEqual(['prod-0', 'prod-1', 'prod-2', 'prod-3', 'prod-4']);
    });
  });
});
