import {describe, it, expect} from 'bun:test';
import {mergeInventories} from './mergeInventories.js';
import {createInventory} from 'shared-save-processing/testing/createFakeSaveContent.js';

describe('Merge Inventories', () => {
  const inventoryA = createInventory({id: 44});
  const inventoryB = createInventory({id: 77});

  describe('When inventories come from both saves', () => {
    it('should keep all inventories from both saves', () => {
      // Arrange
      const inventoriesA = [inventoryA];
      const inventoriesB = [inventoryB];

      // Act
      const result = mergeInventories(inventoriesA, inventoriesB);

      // Assert
      expect(result).toBe(`${JSON.stringify(inventoryA)}|\n${JSON.stringify(inventoryB)}`);
    });
  });

  describe('When an inventory has no ejected player id', () => {
    it('should keep the inventory as it may belong to a world object', () => {
      // Arrange
      const worldObjectInventory = {id: 999, woIds: '', size: 5};
      const inventoriesA = [inventoryA, worldObjectInventory];
      const inventoriesB = [inventoryB];

      // Act
      const result = mergeInventories(inventoriesA, inventoriesB);

      // Assert
      expect(result).toBe([
        JSON.stringify(inventoryA),
        JSON.stringify(worldObjectInventory),
        JSON.stringify(inventoryB)
      ].join('|\n'));
    });

    it('should keep equipment inventories from both saves', () => {
      // Arrange
      const equipmentA = {id: 45, woIds: '', size: 10};
      const equipmentB = {id: 4, woIds: '', size: 10};
      const inventoriesA = [inventoryA, equipmentA];
      const inventoriesB = [inventoryB, equipmentB];

      // Act
      const result = mergeInventories(inventoriesA, inventoriesB);

      // Assert
      expect(result).toBe([
        JSON.stringify(inventoryA),
        JSON.stringify(equipmentA),
        JSON.stringify(inventoryB),
        JSON.stringify(equipmentB)
      ].join('|\n'));
    });
  });

  describe('When two inventories share the same id', () => {
    it('should keep both inventories as the duplicate id will be resolved later', () => {
      // Arrange
      const inventoryFromB = {...inventoryA};
      const inventoriesA = [inventoryA];
      const inventoriesB = [inventoryFromB];

      // Act
      const result = mergeInventories(inventoriesA, inventoriesB);

      // Assert
      expect(result).toBe(`${JSON.stringify(inventoryA)}|\n${JSON.stringify(inventoryFromB)}`);
    });
  });

  describe('When save B contains inventories from an ejected player', () => {
    const orphanInventory = {id: 77, woIds: '901,902', size: 10};
    const orphanEquipment = {id: 78, woIds: '903', size: 5};
    const remainingInventory = createInventory({id: 79});
    const orphanInventoryIds = new Set([orphanInventory.id, orphanEquipment.id]);

    it('should drop the orphan inventories of the ejected player', () => {
      // Arrange
      const inventoriesA = [inventoryA];
      const inventoriesB = [orphanInventory, orphanEquipment, remainingInventory];

      // Act
      const result = mergeInventories(inventoriesA, inventoriesB, orphanInventoryIds);

      // Assert
      expect(result).toBe(`${JSON.stringify(inventoryA)}|\n${JSON.stringify(remainingInventory)}`);
    });
  });
});

