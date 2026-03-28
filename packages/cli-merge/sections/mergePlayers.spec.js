import {describe, it, expect} from 'bun:test';
import {merge} from '../merge.js';
import {createFakeSaveString} from '../../util-testing/fixtures/createFakeSaveString.js';
import {player} from '../../util-testing/fixtures/createFakeSaveContent.js';
import { PLAYERS_SECTION_INDEX } from '../../util-types/js/sectionIndexes.js';

describe('Merge saves — #3 Players', () => {
  const SECTION_SEPARATOR = '@';
  const saveDisplayName = 'SAVE_NAME';

  const saveA_players = [{
    ...player,
    id: 76561198155441595,
    name: 'Nikowa',
  }];

  const saveB_players = [{
    ...player,
    id: 76561198055446664,
    name: 'Chileny',
    host: false,
  }];

  describe('When players are unique', () => {
    it('should concat players from both saves', () => {
      // Arrange
      const fakeSaveA = createFakeSaveString({players: saveA_players});
      const fakeSaveB = createFakeSaveString({players: saveB_players});
      const {mergeSaves} = merge(fakeSaveA, fakeSaveB, saveDisplayName);

      // Act
      const result = mergeSaves();

      // Assert
      expect(result).toBe(createFakeSaveString({players: [...saveA_players, ...saveB_players]}));
    });
  });

  describe('When the same player appears in both saves with a different id', () => {
    it('should deduplicate by name and take the player from save A', () => {
      // Arrange
      const playerInSaveA = {...saveA_players[0], id: 11111, playerGaugeOxygen: 150.0};
      const playerInSaveB = {...saveA_players[0], id: 22222, playerGaugeOxygen: 280.0};
      const fakeSaveA = createFakeSaveString({players: [playerInSaveA]});
      const fakeSaveB = createFakeSaveString({players: [playerInSaveB]});
      const {mergeSaves} = merge(fakeSaveA, fakeSaveB, saveDisplayName);

      // Act
      const result = mergeSaves();

      // Assert
      expect(result).toBe(createFakeSaveString({players: [playerInSaveA]}));
    });
  });

  describe('When a player appears in both saves with the same id', () => {
    it('should take the player from save A', () => {
      // Arrange
      const playerInSaveA = {...saveA_players[0], playerGaugeOxygen: 150.0, inventoryId: 44, equipmentId: 45};
      const playerInSaveB = {...saveA_players[0], playerGaugeOxygen: 280.0, inventoryId: 99, equipmentId: 99};
      const fakeSaveA = createFakeSaveString({players: [playerInSaveA]});
      const fakeSaveB = createFakeSaveString({players: [playerInSaveB]});
      const {mergeSaves} = merge(fakeSaveA, fakeSaveB, saveDisplayName);

      // Act
      const result = mergeSaves();

      // Assert
      expect(result).toBe(createFakeSaveString({players: [playerInSaveA]}));
    });
  });

  describe('When merging host status', () => {
    it('should keep save A host status and set all others to false', () => {
      // Arrange
      const hostInSaveA = {...saveA_players[0], host: true};
      const guestInSaveA = {...saveB_players[0], host: false};
      const hostInSaveB = {...saveB_players[0], host: true};
      const fakeSaveA = createFakeSaveString({players: [hostInSaveA, guestInSaveA]});
      const fakeSaveB = createFakeSaveString({players: [hostInSaveB]});
      const {mergeSaves} = merge(fakeSaveA, fakeSaveB, saveDisplayName);

      // Act
      const result = mergeSaves();

      // Assert
      expect(result).toBe(createFakeSaveString({
        players: [
          {...hostInSaveA, host: true},
          {...guestInSaveA, host: false}
        ]
      }));
    });
  });

  describe('When merging planetId', () => {
    it('should preserve each player own planetId', () => {
      // Arrange
      const hostInSaveA = {...saveA_players[0], host: true, planetId: 'Toxicity'};
      const playerInSaveB = {...saveB_players[0], host: false, planetId: 'Prime'};
      const fakeSaveA = createFakeSaveString({players: [hostInSaveA]});
      const fakeSaveB = createFakeSaveString({players: [playerInSaveB]});
      const {mergeSaves} = merge(fakeSaveA, fakeSaveB, saveDisplayName);

      // Act
      const result = mergeSaves();

      // Assert
      expect(result).toBe(createFakeSaveString({
        players: [
          {...hostInSaveA, planetId: 'Toxicity'},
          {...playerInSaveB, planetId: 'Prime'}
        ]
      }));
    });
  });

  describe('When player gauges have integer values', () => {
    it('should preserve decimal notation for whole number player gauge values', () => {
      // Arrange
      const player = {...saveA_players[0], playerGaugeOxygen: 280.0, playerGaugeToxic: 0.0};
      const fakeSaveA = createFakeSaveString({players: [player]});
      const fakeSaveB = createFakeSaveString({players: []});
      const {mergeSaves} = merge(fakeSaveA, fakeSaveB, saveDisplayName);

      // Act
      const result = mergeSaves();

      // Assert
      const playersSection = result.split(SECTION_SEPARATOR)[PLAYERS_SECTION_INDEX];
      expect(playersSection).toInclude('"playerGaugeOxygen":280.0');
      expect(playersSection).toInclude('"playerGaugeToxic":0.0');
    });
  });
});
