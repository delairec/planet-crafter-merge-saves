import {describe, expect, it} from 'bun:test';
import {rewriteInventoryReferences, rewritePlayerReferences, rewriteWorldObjectReferences} from './rewriteReferences';
import {Player} from 'shared-save-processing/gameDefinitions';

describe('Rewrite references', () => {
  const noRemapping = {inventoryIds: new Map<number, number>(), worldObjectIds: new Map<number, number>()};
  const inventory10BecameInventory51 = {inventoryIds: new Map([[10, 51]]), worldObjectIds: new Map<number, number>()};
  const worldObject100BecameWorldObject501 = {inventoryIds: new Map<number, number>(), worldObjectIds: new Map([[100, 501]])};

  function createPlayer(id: number, inventoryId: number, equipmentId: number): Player {
    return {
      id, inventoryId, equipmentId,
      name: 'Nikowa',
      playerPosition: '0,0,0',
      playerRotation: '0,0,0,0',
      playerGaugeOxygen: 280.0,
      playerGaugeThirst: 96.0,
      playerGaugeHealth: 72.0,
      playerGaugeToxic: 0.0,
      host: true,
      planetId: 'Toxicity',
      cameraView: 0,
      totalCraftedObjects: 0,
      totalTerraTokenEarned: 0
    };
  }

  describe('When both saves have a player on a renumbered inventory', () => {
    it('should point the save B player at the new inventory id', () => {
      // Arrange
      const playerFromSaveB = createPlayer(2, 10, 11);
      const players = {fromSaveA: [createPlayer(1, 10, 11)], fromSaveB: [playerFromSaveB]};

      // Act
      const result = rewritePlayerReferences(players, inventory10BecameInventory51);

      // Assert
      expect(result.fromSaveB).toEqual([{...playerFromSaveB, inventoryId: 51, equipmentId: 11}]);
    });

    it('should leave the save A player pointing at the id it always used', () => {
      // Arrange
      const playerFromSaveA = createPlayer(1, 10, 11);
      const players = {fromSaveA: [playerFromSaveA], fromSaveB: [createPlayer(2, 10, 11)]};

      // Act
      const result = rewritePlayerReferences(players, inventory10BecameInventory51);

      // Assert
      expect(result.fromSaveA).toEqual([playerFromSaveA]);
    });
  });

  describe('When no save A player uses the renumbered inventory id', () => {
    it('should still point the save B player at its own renumbered inventory', () => {
      // Arrange
      const playerFromSaveB = createPlayer(2, 10, 11);
      const players = {fromSaveA: [createPlayer(1, 30, 31)], fromSaveB: [playerFromSaveB]};

      // Act
      const result = rewritePlayerReferences(players, inventory10BecameInventory51);

      // Assert
      expect(result.fromSaveB).toEqual([{...playerFromSaveB, inventoryId: 51, equipmentId: 11}]);
    });
  });

  describe('When an inventory linked to a world object was renumbered', () => {
    it('should point the save B world object linked inventory at the new id', () => {
      // Arrange
      const worldObjects = {fromSaveA: [{id: 1, gId: 'Container2', liId: 10}], fromSaveB: [{id: 2, gId: 'Container2', liId: 10}]};

      // Act
      const result = rewriteWorldObjectReferences(worldObjects, inventory10BecameInventory51);

      // Assert
      expect(result.fromSaveB).toEqual([{id: 2, gId: 'Container2', liId: 51}]);
    });

    it('should point every save B sub-inventory slot at its new id', () => {
      // Arrange
      const worldObjects = {fromSaveA: [], fromSaveB: [{id: 2, gId: 'Farm1', siIds: '10,20,10'}]};

      // Act
      const result = rewriteWorldObjectReferences(worldObjects, inventory10BecameInventory51);

      // Assert
      expect(result.fromSaveB).toEqual([{id: 2, gId: 'Farm1', siIds: '51,20,51'}]);
    });

    it('should leave the save A world object untouched', () => {
      // Arrange
      const worldObjects = {fromSaveA: [{id: 1, gId: 'Container2', liId: 10, siIds: '10'}], fromSaveB: []};

      // Act
      const result = rewriteWorldObjectReferences(worldObjects, inventory10BecameInventory51);

      // Assert
      expect(result.fromSaveA).toEqual([{id: 1, gId: 'Container2', liId: 10, siIds: '10'}]);
    });
  });

  describe('When a world object was renumbered', () => {
    it('should point a save B linked world object at the new id', () => {
      // Arrange
      const worldObjects = {fromSaveA: [], fromSaveB: [{id: 2, gId: 'WaterGenerator', linkedWo: 100}]};

      // Act
      const result = rewriteWorldObjectReferences(worldObjects, worldObject100BecameWorldObject501);

      // Assert
      expect(result.fromSaveB).toEqual([{id: 2, gId: 'WaterGenerator', linkedWo: 501}]);
    });

    it('should point the contained world object ids of a save B world object at the new id', () => {
      // Arrange
      const worldObjects = {fromSaveA: [], fromSaveB: [{id: 2, gId: 'Container2', woIds: '100,200'}]};

      // Act
      const result = rewriteWorldObjectReferences(worldObjects, worldObject100BecameWorldObject501);

      // Assert
      expect(result.fromSaveB).toEqual([{id: 2, gId: 'Container2', woIds: '501,200'}]);
    });
  });

  describe('When a save B inventory holds a renumbered world object', () => {
    it('should point its contents at the new world object id', () => {
      // Arrange
      const inventories = {fromSaveA: [{id: 40, woIds: '100', size: 20}], fromSaveB: [{id: 30, woIds: '100,200', size: 20}]};

      // Act
      const result = rewriteInventoryReferences(inventories, worldObject100BecameWorldObject501);

      // Assert
      expect(result.fromSaveB).toEqual([{id: 30, woIds: '501,200', size: 20}]);
    });

    it('should leave the save A inventory untouched', () => {
      // Arrange
      const inventories = {fromSaveA: [{id: 40, woIds: '100', size: 20}], fromSaveB: []};

      // Act
      const result = rewriteInventoryReferences(inventories, worldObject100BecameWorldObject501);

      // Assert
      expect(result.fromSaveA).toEqual([{id: 40, woIds: '100', size: 20}]);
    });
  });

  describe('When nothing was renumbered', () => {
    it('should leave every reference as it is', () => {
      // Arrange
      const worldObjects = {fromSaveA: [], fromSaveB: [{id: 2, gId: 'Container2', liId: 10, siIds: '10,20', linkedWo: 100, woIds: '100'}]};

      // Act
      const result = rewriteWorldObjectReferences(worldObjects, noRemapping);

      // Assert
      expect(result.fromSaveB).toEqual([{id: 2, gId: 'Container2', liId: 10, siIds: '10,20', linkedWo: 100, woIds: '100'}]);
    });

    it('should leave an empty contained world object list as it is', () => {
      // Arrange
      const inventories = {fromSaveA: [], fromSaveB: [{id: 2, woIds: '', size: 20}]};

      // Act
      const result = rewriteInventoryReferences(inventories, worldObject100BecameWorldObject501);

      // Assert
      expect(result.fromSaveB).toEqual([{id: 2, woIds: '', size: 20}]);
    });
  });
});
