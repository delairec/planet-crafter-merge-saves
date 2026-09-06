import {describe, expect, it} from 'bun:test';
import {mergePlayers} from './mergePlayers';

describe('Merge players', () => {
  const basePlayer = {
    id: 76561198155441595,
    name: 'Nikowa',
    inventoryId: 44,
    equipmentId: 45,
    playerPosition: '1751.865,472.58,-1106.104',
    playerRotation: '0,0.5740051,0,-0.8188518',
    playerGaugeOxygen: 280.0,
    playerGaugeThirst: 96.3858642578125,
    playerGaugeHealth: 72.67363739013672,
    playerGaugeToxic: 0.0,
    host: true,
    planetId: 'Toxicity',
    cameraView: 0,
    totalCraftedObjects: 0,
    totalTerraTokenEarned: 0
  };

  const playerFromSaveA = {...basePlayer};
  const playerFromSaveB = {...basePlayer, id: 76561198055446664, name: 'Chileny', host: false};

  describe('When players are unique', () => {
    it('should keep the players of each save under their own origin', () => {
      // Act
      const result = mergePlayers([playerFromSaveA], [playerFromSaveB]);

      // Assert
      expect(result).toEqual({fromSaveA: [playerFromSaveA], fromSaveB: [playerFromSaveB]});
    });
  });

  describe('When the same player appears in both saves with a different id', () => {
    it('should deduplicate by name and take the player from save A', () => {
      // Arrange
      const playerInSaveA = {...playerFromSaveA, id: 11111, playerGaugeOxygen: 150.0};
      const playerInSaveB = {...playerFromSaveA, id: 22222, playerGaugeOxygen: 280.0};

      // Act
      const result = mergePlayers([playerInSaveA], [playerInSaveB]);

      // Assert
      expect(result).toEqual({fromSaveA: [{...playerInSaveA, host: true}], fromSaveB: []});
    });
  });

  describe('When a player appears in both saves with the same id', () => {
    it('should take the player from save A', () => {
      // Arrange
      const playerInSaveA = {...playerFromSaveA, playerGaugeOxygen: 150.0};
      const playerInSaveB = {...playerFromSaveA, playerGaugeOxygen: 280.0, inventoryId: 99, equipmentId: 99};

      // Act
      const result = mergePlayers([playerInSaveA], [playerInSaveB]);

      // Assert
      expect(result).toEqual({fromSaveA: [{...playerInSaveA, host: true}], fromSaveB: []});
    });
  });

  describe('When merging host status', () => {
    it('should keep save A host status and set all others to false', () => {
      // Arrange
      const hostInSaveA = {...playerFromSaveA, host: true};
      const guestInSaveA = {...playerFromSaveB, host: false};
      const hostInSaveB = {...playerFromSaveB, host: true};

      // Act
      const result = mergePlayers([hostInSaveA, guestInSaveA], [hostInSaveB]);

      // Assert
      expect(result).toEqual({
        fromSaveA: [{...hostInSaveA, host: true}, {...guestInSaveA, host: false}],
        fromSaveB: []
      });
    });
  });

  describe('When merging planetId', () => {
    it('should preserve each player own planetId', () => {
      // Arrange
      const hostInSaveA = {...playerFromSaveA, host: true, planetId: 'Toxicity'};
      const playerInSaveB = {...playerFromSaveB, host: false, planetId: 'Prime'};

      // Act
      const result = mergePlayers([hostInSaveA], [playerInSaveB]);

      // Assert
      expect(result).toEqual({
        fromSaveA: [{...hostInSaveA, planetId: 'Toxicity'}],
        fromSaveB: [{...playerInSaveB, planetId: 'Prime'}]
      });
    });
  });

  describe('When a player is missing cameraView, totalCraftedObjects or totalTerraTokenEarned', () => {
    it('should default the missing fields to 0', () => {
      // Arrange
      const {cameraView: _cameraView, totalCraftedObjects: _totalCraftedObjects, totalTerraTokenEarned: _totalTerraTokenEarned, ...legacyPlayer} = playerFromSaveA;
      const noPlayersFromSaveB: never[] = [];

      // Act
      const result = mergePlayers([legacyPlayer], noPlayersFromSaveB);

      // Assert
      expect(result.fromSaveA).toEqual([{...legacyPlayer, cameraView: 0, totalCraftedObjects: 0, totalTerraTokenEarned: 0, host: true}]);
    });
  });
});
