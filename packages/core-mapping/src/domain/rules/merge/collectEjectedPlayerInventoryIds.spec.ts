import {describe, expect, it} from 'bun:test';
import {Player, Inventory} from 'shared-save-processing/gameDefinitions';
import {collectEjectedPlayerInventoryIds} from './collectEjectedPlayerInventoryIds';

describe('collectEjectedPlayerInventoryIds', () => {
  const basePlayer: Player = {
    id: 76561198155441595,
    name: 'Nikowa',
    inventoryId: 44,
    equipmentId: 45,
    playerPosition: '0,0,0',
    playerRotation: '0,0,0,1',
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

  describe('When no player in save B shares a name with a player in save A', () => {
    it('should return empty inventory and world object id sets', () => {
      // Arrange
      const playersA: Player[] = [{...basePlayer, name: 'Nikowa'}];
      const playersB: Player[] = [{...basePlayer, name: 'Chileny', inventoryId: 50, equipmentId: 51}];
      const inventoriesB: Inventory[] = [{id: 50, woIds: '900,901', size: 20}];

      // Act
      const result = collectEjectedPlayerInventoryIds(playersA, playersB, inventoriesB);

      // Assert
      expect(result.orphanInventoryIds).toEqual(new Set());
      expect(result.orphanWorldObjectIds).toEqual(new Set());
    });
  });

  describe('When a player in save B shares a name with a player in save A', () => {
    it('should collect the inventory and equipment ids of the ejected player from save B', () => {
      // Arrange
      const playersA: Player[] = [{...basePlayer, name: 'Nikowa'}];
      const playersB: Player[] = [{...basePlayer, name: 'Nikowa', inventoryId: 50, equipmentId: 51}];
      const inventoriesB: Inventory[] = [];

      // Act
      const result = collectEjectedPlayerInventoryIds(playersA, playersB, inventoriesB);

      // Assert
      expect(result.orphanInventoryIds).toEqual(new Set([50, 51]));
    });

    it('should collect the world object ids held in the ejected player inventory and equipment from save B', () => {
      // Arrange
      const playersA: Player[] = [{...basePlayer, name: 'Nikowa'}];
      const playersB: Player[] = [{...basePlayer, name: 'Nikowa', inventoryId: 50, equipmentId: 51}];
      const inventoriesB: Inventory[] = [
        {id: 50, woIds: '900,901', size: 20},
        {id: 51, woIds: '902', size: 10}
      ];

      // Act
      const result = collectEjectedPlayerInventoryIds(playersA, playersB, inventoriesB);

      // Assert
      expect(result.orphanWorldObjectIds).toEqual(new Set([900, 901, 902]));
    });

    it('should not collect world object ids from an inventory that does not belong to an ejected player', () => {
      // Arrange
      const playersA: Player[] = [{...basePlayer, name: 'Nikowa'}];
      const playersB: Player[] = [
        {...basePlayer, name: 'Nikowa', inventoryId: 50, equipmentId: 51},
        {...basePlayer, id: 999, name: 'Chileny', inventoryId: 60, equipmentId: 61}
      ];
      const inventoriesB: Inventory[] = [
        {id: 50, woIds: '900', size: 20},
        {id: 60, woIds: '901', size: 20}
      ];

      // Act
      const result = collectEjectedPlayerInventoryIds(playersA, playersB, inventoriesB);

      // Assert
      expect(result.orphanWorldObjectIds).toEqual(new Set([900]));
    });
  });

  describe('When an ejected player inventory has no world objects', () => {
    it('should not add any world object id for that inventory', () => {
      // Arrange
      const playersA: Player[] = [{...basePlayer, name: 'Nikowa'}];
      const playersB: Player[] = [{...basePlayer, name: 'Nikowa', inventoryId: 50, equipmentId: 51}];
      const inventoriesB: Inventory[] = [{id: 50, woIds: '', size: 20}];

      // Act
      const result = collectEjectedPlayerInventoryIds(playersA, playersB, inventoriesB);

      // Assert
      expect(result.orphanWorldObjectIds).toEqual(new Set());
    });
  });
});
