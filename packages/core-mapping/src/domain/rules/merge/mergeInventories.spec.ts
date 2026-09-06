import {describe, it, expect} from 'bun:test';
import {mergeInventories} from './mergeInventories';

describe('Merge Inventories', () => {
  const noOrphanInventoryIds = new Set<number>();
  const inventoryFromSaveA = {id: 44, woIds: '79111656,58524136', size: 20};
  const inventoryFromSaveB = {id: 77, woIds: '79111656,58524136', size: 20};

  describe('When inventories come from both saves', () => {
    it('should keep the inventories of each save under their own origin', () => {
      // Act
      const result = mergeInventories([inventoryFromSaveA], [inventoryFromSaveB], noOrphanInventoryIds);

      // Assert
      expect(result).toEqual({
        fromSaveA: [{id: 44, woIds: '79111656,58524136', size: 20}],
        fromSaveB: [{id: 77, woIds: '79111656,58524136', size: 20}]
      });
    });
  });

  describe('When an inventory has no ejected player id', () => {
    it('should keep the inventory as it may belong to a world object', () => {
      // Arrange
      const worldObjectInventory = {id: 999, woIds: '', size: 5};

      // Act
      const result = mergeInventories([inventoryFromSaveA, worldObjectInventory], [inventoryFromSaveB], noOrphanInventoryIds);

      // Assert
      expect(result.fromSaveA).toEqual([
        {id: 44, woIds: '79111656,58524136', size: 20},
        {id: 999, woIds: '', size: 5}
      ]);
    });

    it('should keep equipment inventories from both saves', () => {
      // Arrange
      const equipmentFromSaveA = {id: 45, woIds: '', size: 10};
      const equipmentFromSaveB = {id: 4, woIds: '', size: 10};

      // Act
      const result = mergeInventories([inventoryFromSaveA, equipmentFromSaveA], [inventoryFromSaveB, equipmentFromSaveB], noOrphanInventoryIds);

      // Assert
      expect(result).toEqual({
        fromSaveA: [{id: 44, woIds: '79111656,58524136', size: 20}, {id: 45, woIds: '', size: 10}],
        fromSaveB: [{id: 77, woIds: '79111656,58524136', size: 20}, {id: 4, woIds: '', size: 10}]
      });
    });
  });

  describe('When two inventories share the same id', () => {
    it('should keep both inventories as the duplicate id will be resolved later', () => {
      // Arrange
      const duplicatedInventoryFromSaveB = {...inventoryFromSaveA};

      // Act
      const result = mergeInventories([inventoryFromSaveA], [duplicatedInventoryFromSaveB], noOrphanInventoryIds);

      // Assert
      expect(result).toEqual({
        fromSaveA: [{id: 44, woIds: '79111656,58524136', size: 20}],
        fromSaveB: [{id: 44, woIds: '79111656,58524136', size: 20}]
      });
    });
  });

  describe('When save B contains inventories from an ejected player', () => {
    it('should drop the orphan inventories of the ejected player', () => {
      // Arrange
      const orphanInventory = {id: 77, woIds: '901,902', size: 10};
      const orphanEquipment = {id: 78, woIds: '903', size: 5};
      const remainingInventory = {id: 79, woIds: '904', size: 20};
      const orphanInventoryIds = new Set([77, 78]);

      // Act
      const result = mergeInventories([inventoryFromSaveA], [orphanInventory, orphanEquipment, remainingInventory], orphanInventoryIds);

      // Assert
      expect(result.fromSaveB).toEqual([{id: 79, woIds: '904', size: 20}]);
    });
  });
});
