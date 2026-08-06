import {describe, expect, it} from 'bun:test';
import {mergePlayers} from './mergePlayers.js';
import { PLAYERS_SECTION_INDEX } from '../../util-types/js/sectionIndexes.js';

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

  const playersFromSaveA = [{
    ...basePlayer,
    id: 76561198155441595,
    name: 'Nikowa',
  }];

  const playersFromSaveB = [{
    ...basePlayer,
    id: 76561198055446664,
    name: 'Chileny',
    host: false,
  }];

  function parsePlayers(serializedPlayers) {
    return serializedPlayers.split('|\n').map(player => JSON.parse(player));
  }

  describe('When players are unique', () => {
    it('should concat players from both saves', () => {
      // Act
      const result = mergePlayers(playersFromSaveA, playersFromSaveB);

      // Assert
      expect(parsePlayers(result)).toEqual([...playersFromSaveA, ...playersFromSaveB]);
    });
  });

  describe('When the same player appears in both saves with a different id', () => {
    it('should deduplicate by name and take the player from save A', () => {
      // Arrange
      const playerInSaveA = {...playersFromSaveA[0], id: 11111, playerGaugeOxygen: 150.0};
      const playerInSaveB = {...playersFromSaveA[0], id: 22222, playerGaugeOxygen: 280.0};

      // Act
      const result = mergePlayers([playerInSaveA], [playerInSaveB]);

      // Assert
      expect(parsePlayers(result)).toEqual([{...playerInSaveA, host: true}]);
    });
  });

  describe('When a player appears in both saves with the same id', () => {
    it('should take the player from save A', () => {
      // Arrange
      const playerInSaveA = {...playersFromSaveA[0], playerGaugeOxygen: 150.0, inventoryId: 44, equipmentId: 45};
      const playerInSaveB = {...playersFromSaveA[0], playerGaugeOxygen: 280.0, inventoryId: 99, equipmentId: 99};

      // Act
      const result = mergePlayers([playerInSaveA], [playerInSaveB]);

      // Assert
      expect(parsePlayers(result)).toEqual([{...playerInSaveA, host: true}]);
    });
  });

  describe('When merging host status', () => {
    it('should keep save A host status and set all others to false', () => {
      // Arrange
      const hostInSaveA = {...playersFromSaveA[0], host: true};
      const guestInSaveA = {...playersFromSaveB[0], host: false};
      const hostInSaveB = {...playersFromSaveB[0], host: true};

      // Act
      const result = mergePlayers([hostInSaveA, guestInSaveA], [hostInSaveB]);

      // Assert
      expect(parsePlayers(result)).toEqual([
        {...hostInSaveA, host: true},
        {...guestInSaveA, host: false}
      ]);
    });
  });

  describe('When merging planetId', () => {
    it('should preserve each player own planetId', () => {
      // Arrange
      const hostInSaveA = {...playersFromSaveA[0], host: true, planetId: 'Toxicity'};
      const playerInSaveB = {...playersFromSaveB[0], host: false, planetId: 'Prime'};

      // Act
      const result = mergePlayers([hostInSaveA], [playerInSaveB]);

      // Assert
      expect(parsePlayers(result)).toEqual([
        {...hostInSaveA, planetId: 'Toxicity'},
        {...playerInSaveB, planetId: 'Prime', host: false}
      ]);
    });
  });

  describe('When player gauges have integer values', () => {
    it('should preserve decimal notation for whole number player gauge values', () => {
      // Arrange
      const playerWithWholeNumberGauges = {...playersFromSaveA[0], playerGaugeOxygen: 280.0, playerGaugeToxic: 0.0};

      // Act
      const result = mergePlayers([playerWithWholeNumberGauges], []);

      // Assert
      expect(result).toInclude('"playerGaugeOxygen":280.0');
      expect(result).toInclude('"playerGaugeToxic":0.0');
    });
  });

  describe('When a player is missing cameraView, totalCraftedObjects or totalTerraTokenEarned', () => {
    it('should default the missing fields to 0', () => {
      // Arrange
      const {cameraView: _cameraView, totalCraftedObjects: _totalCraftedObjects, totalTerraTokenEarned: _totalTerraTokenEarned, ...legacyPlayer} = playersFromSaveA[0];

      // Act
      const result = mergePlayers([legacyPlayer], []);

      // Assert
      expect(parsePlayers(result)).toEqual([{...legacyPlayer, cameraView: 0, totalCraftedObjects: 0, totalTerraTokenEarned: 0, host: true}]);
    });
  });
});
