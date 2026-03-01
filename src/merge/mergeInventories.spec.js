import {describe, it, expect} from 'bun:test';
import {merge} from './merge.js';
import {createFakeSaveString} from '../utils/testing/fixtures/createFakeSaveString.js';
import {inventory, player} from '../utils/testing/fixtures/createFakeSaveContent.js';

describe('Merge saves — #4 Inventories', () => {
  const saveDisplayName = 'SAVE_NAME';

  const playerA = {
    ...player,
    id: 1,
    name: 'Nikowa'
  };

  const playerB = {
    ...player,
    id: 2,
    name: 'Chileny',
    host: false
  };

  const inventoryA = inventory;

  const inventoryB = inventory;

  describe('When inventories belong to existing players', () => {
    it('should keep all inventories from both saves', () => {
      // Arrange
      const fakeSaveA = createFakeSaveString({players: [playerA], inventories: [inventoryA]});
      const fakeSaveB = createFakeSaveString({players: [playerB], inventories: [inventoryB]});
      const {mergeSaves} = merge(fakeSaveA, fakeSaveB, saveDisplayName);

      // Act
      const result = mergeSaves();

      // Assert
      expect(result).toBe(createFakeSaveString({players: [playerA, playerB], inventories: [inventoryA, inventoryB]}));
    });
  });

  describe('When an inventory has no corresponding player after merge', () => {
    it('should keep the inventory as it may belong to a world object', () => {
      // Arrange
      const worldObjectInventory = {id: 999, woIds: '', size: 5};
      const fakeSaveA = createFakeSaveString({players: [playerA], inventories: [inventoryA, worldObjectInventory]});
      const fakeSaveB = createFakeSaveString({players: [playerB], inventories: [inventoryB]});
      const {mergeSaves} = merge(fakeSaveA, fakeSaveB, saveDisplayName);

      // Act
      const result = mergeSaves();

      // Assert
      expect(result).toBe(createFakeSaveString({players: [playerA, playerB], inventories: [inventoryA, worldObjectInventory, inventoryB]}));
    });

    it('should keep equipment matching equipmentId of existing players', () => {
      // Arrange
      const equipmentA = {id: 45, woIds: '', size: 10};
      const equipmentB = {id: 4, woIds: '', size: 10};
      const fakeSaveA = createFakeSaveString({players: [playerA], inventories: [inventoryA, equipmentA]});
      const fakeSaveB = createFakeSaveString({players: [playerB], inventories: [inventoryB, equipmentB]});
      const {mergeSaves} = merge(fakeSaveA, fakeSaveB, saveDisplayName);

      // Act
      const result = mergeSaves();

      // Assert
      expect(result).toBe(createFakeSaveString({
        players: [playerA, playerB],
        inventories: [inventoryA, equipmentA, inventoryB, equipmentB]
      }));
    });
  });

  describe('When two inventories share the same id', () => {
    it('should keep both inventories as the duplicate id will be resolved later', () => {
      // Arrange
      const inventoryFromB = inventoryA;
      const playerBWithSameInventoryId = {...playerB, inventoryId: 44};
      const fakeSaveA = createFakeSaveString({players: [playerA], inventories: [inventoryA]});
      const fakeSaveB = createFakeSaveString({players: [playerBWithSameInventoryId], inventories: [inventoryFromB]});
      const {mergeSaves} = merge(fakeSaveA, fakeSaveB, saveDisplayName);

      // Act
      const result = mergeSaves();

      // Assert
      expect(result).toBe(createFakeSaveString({
        players: [playerA, playerBWithSameInventoryId],
        inventories: [inventoryA, inventoryFromB]
      }));
    });
  });

  describe('When a player from B is ejected because they share a name with a player from A', () => {
    const ejectedPlayerB = {
      ...playerB,
      name: playerA.name, inventoryId: 77, equipmentId: 78,
    };
    const orphanInventory = {id: 77, woIds: '901,902', size: 10};
    const orphanEquipment = {id: 78, woIds: '903', size: 5};
    const orphanItem1 = {id: 901, gId: 'Iron'};
    const orphanItem2 = {id: 902, gId: 'Cobalt'};
    const orphanItem3 = {id: 903, gId: 'AirFilter1'};

    it('should drop the orphan inventories of the ejected player', () => {
      // Arrange
      const fakeSaveA = createFakeSaveString({players: [playerA], inventories: [inventoryA]});
      const fakeSaveB = createFakeSaveString({
        players: [ejectedPlayerB, playerB],
        inventories: [orphanInventory, orphanEquipment, inventoryB]
      });
      const {mergeSaves} = merge(fakeSaveA, fakeSaveB, saveDisplayName);

      // Act
      const result = mergeSaves();

      // Assert
      expect(result).toBe(createFakeSaveString({
        players: [playerA, playerB],
        inventories: [inventoryA, inventoryB]
      }));
    });

    it('should drop the world objects that were in the orphan inventories', () => {
      // Arrange
      const fakeSaveA = createFakeSaveString({players: [playerA], inventories: [inventoryA]});
      const fakeSaveB = createFakeSaveString({
        players: [ejectedPlayerB, playerB],
        inventories: [orphanInventory, orphanEquipment, inventoryB],
        worldObjects: [orphanItem1, orphanItem2, orphanItem3]
      });
      const {mergeSaves} = merge(fakeSaveA, fakeSaveB, saveDisplayName);

      // Act
      const result = mergeSaves();

      // Assert
      expect(result).toBe(createFakeSaveString({
        players: [playerA, playerB],
        inventories: [inventoryA, inventoryB],
        worldObjects: []
      }));
    });
  });
});

