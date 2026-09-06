import {describe, expect, it} from 'bun:test';
import {resolveInventoryIdConflicts} from './resolveInventoryIdConflicts';
import {createIdSequence} from './createIdSequence';

describe('Resolve inventory id conflicts', () => {
  const inventoryOfSaveA = {id: 10, woIds: '', size: 20};
  const equipmentOfSaveA = {id: 11, woIds: '', size: 10};

  describe('When a save B inventory uses an id already taken in save A', () => {
    it('should give that inventory a new id above every existing inventory id', () => {
      // Arrange
      const inventories = {fromSaveA: [inventoryOfSaveA], fromSaveB: [{id: 10, woIds: '', size: 35}]};

      // Act
      const result = resolveInventoryIdConflicts(inventories, createIdSequence([inventoryOfSaveA]));

      // Assert
      expect(result.entries.fromSaveB).toEqual([{id: 11, woIds: '', size: 35}]);
    });

    it('should report the new id under the id it replaces', () => {
      // Arrange
      const inventories = {fromSaveA: [inventoryOfSaveA], fromSaveB: [{id: 10, woIds: '', size: 35}]};

      // Act
      const result = resolveInventoryIdConflicts(inventories, createIdSequence([inventoryOfSaveA]));

      // Assert
      expect(result.saveBIdRemapping).toEqual(new Map([[10, 11]]));
    });

    it('should leave the save A inventories untouched', () => {
      // Arrange
      const inventories = {fromSaveA: [inventoryOfSaveA], fromSaveB: [{id: 10, woIds: '', size: 35}]};

      // Act
      const result = resolveInventoryIdConflicts(inventories, createIdSequence([inventoryOfSaveA]));

      // Assert
      expect(result.entries.fromSaveA).toEqual([{id: 10, woIds: '', size: 20}]);
    });
  });

  describe('When both the inventory and the equipment of a save B player conflict', () => {
    it('should give each of them its own new id', () => {
      // Arrange
      const inventories = {
        fromSaveA: [inventoryOfSaveA, equipmentOfSaveA],
        fromSaveB: [{id: 10, woIds: '', size: 35}, {id: 11, woIds: '', size: 5}]
      };

      // Act
      const result = resolveInventoryIdConflicts(inventories, createIdSequence([inventoryOfSaveA, equipmentOfSaveA]));

      // Assert
      expect(result.entries.fromSaveB).toEqual([{id: 12, woIds: '', size: 35}, {id: 13, woIds: '', size: 5}]);
    });
  });

  describe('When a save B inventory uses an id that is free', () => {
    it('should keep its id and report no remapping', () => {
      // Arrange
      const inventories = {fromSaveA: [inventoryOfSaveA], fromSaveB: [{id: 99, woIds: '', size: 50}]};

      // Act
      const result = resolveInventoryIdConflicts(inventories, createIdSequence([inventoryOfSaveA]));

      // Assert
      expect(result.entries.fromSaveB).toEqual([{id: 99, woIds: '', size: 50}]);
      expect(result.saveBIdRemapping).toEqual(new Map());
    });
  });
});
