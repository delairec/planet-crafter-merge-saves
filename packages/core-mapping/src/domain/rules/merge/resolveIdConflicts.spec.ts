import {describe, expect, it} from 'bun:test';
import {resolveIdConflicts} from './resolveIdConflicts';
import {MergedSaveSections} from './MergedSaveSections';
import {Inventory, Player, WorldObject} from 'shared-save-processing/gameDefinitions';
import {EntriesByOrigin} from './EntriesByOrigin';

describe('Resolve id conflicts', () => {
  const basePlayer = {
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

  function aPlayer(overrides: Partial<Player>): Player {
    return {...basePlayer, id: 1, inventoryId: 10, equipmentId: 11, ...overrides};
  }

  function mergedSections(overrides: {
    players?: EntriesByOrigin<Player>,
    inventories?: EntriesByOrigin<Inventory>,
    worldObjects?: EntriesByOrigin<WorldObject>
  }): MergedSaveSections {
    return {
      globalMetadata: {terraTokens: 0, allTimeTerraTokens: 0, unlockedGroups: '', openedInstanceSeed: 0, openedInstanceTimeLeft: 0},
      terraformationLevels: [],
      players: {fromSaveA: [], fromSaveB: []},
      worldObjects: {fromSaveA: [], fromSaveB: []},
      inventories: {fromSaveA: [], fromSaveB: []},
      statistics: undefined,
      mailboxes: [],
      storyEvents: [],
      saveConfiguration: undefined,
      worldEvents: [],
      ...overrides
    };
  }

  describe('When no identifier is shared between the two saves', () => {
    it('should return the sections unchanged', () => {
      // Arrange
      const sections = mergedSections({
        players: {fromSaveA: [aPlayer({id: 1})], fromSaveB: [aPlayer({id: 2, inventoryId: 20, equipmentId: 21})]},
        inventories: {
          fromSaveA: [{id: 10, woIds: '100', size: 20}, {id: 11, woIds: '', size: 10}],
          fromSaveB: [{id: 20, woIds: '', size: 20}, {id: 21, woIds: '', size: 10}]
        },
        worldObjects: {fromSaveA: [{id: 100, gId: 'SomeObject'}], fromSaveB: [{id: 200, gId: 'OtherObject'}]}
      });

      // Act
      const result = resolveIdConflicts(sections);

      // Assert
      expect({
        playerIds: [...result.players.fromSaveA, ...result.players.fromSaveB].map(player => player.id),
        inventoryIds: [...result.inventories.fromSaveA, ...result.inventories.fromSaveB].map(inventory => inventory.id),
        worldObjectIds: [...result.worldObjects.fromSaveA, ...result.worldObjects.fromSaveB].map(worldObject => worldObject.id),
        firstInventoryContent: result.inventories.fromSaveA[0]?.woIds
      }).toEqual({
        playerIds: [1, 2],
        inventoryIds: [10, 11, 20, 21],
        worldObjectIds: [100, 200],
        firstInventoryContent: '100'
      });
    });
  });

  describe('When both saves use the same identifiers', () => {
    it('should renumber the save B entries and keep every entry of both saves', () => {
      // Arrange
      const sections = mergedSections({
        players: {fromSaveA: [aPlayer({id: 1})], fromSaveB: [aPlayer({id: 1, name: 'Chileny'})]},
        inventories: {
          fromSaveA: [{id: 10, woIds: '', size: 20}, {id: 11, woIds: '', size: 10}],
          fromSaveB: [{id: 10, woIds: '', size: 35}, {id: 11, woIds: '', size: 5}]
        },
        worldObjects: {fromSaveA: [{id: 100, gId: 'SomeObject'}], fromSaveB: [{id: 100, gId: 'OtherObject'}]}
      });

      // Act
      const result = resolveIdConflicts(sections);

      // Assert
      expect({
        playerIds: [...result.players.fromSaveA, ...result.players.fromSaveB].map(player => player.id),
        inventoryIds: [...result.inventories.fromSaveA, ...result.inventories.fromSaveB].map(inventory => inventory.id),
        worldObjectIds: [...result.worldObjects.fromSaveA, ...result.worldObjects.fromSaveB].map(worldObject => worldObject.id)
      }).toEqual({
        playerIds: [1, 12],
        inventoryIds: [10, 11, 13, 14],
        worldObjectIds: [100, 101]
      });
    });

    it('should point the save B player at its own renumbered inventory and equipment', () => {
      // Arrange
      const sections = mergedSections({
        players: {fromSaveA: [aPlayer({id: 1})], fromSaveB: [aPlayer({id: 2, name: 'Chileny'})]},
        inventories: {
          fromSaveA: [{id: 10, woIds: '', size: 20}, {id: 11, woIds: '', size: 10}],
          fromSaveB: [{id: 10, woIds: '', size: 35}, {id: 11, woIds: '', size: 5}]
        }
      });

      // Act
      const result = resolveIdConflicts(sections);

      // Assert
      expect(result.players.fromSaveB.map(player => ({inventoryId: player.inventoryId, equipmentId: player.equipmentId})))
        .toEqual([{inventoryId: 12, equipmentId: 13}]);
    });
  });

  describe('When both saves have a world object linked to the same inventory id', () => {
    it('should send the save B world object to the renumbered inventory and leave the save A one on the shared id', () => {
      // Arrange
      const sections = mergedSections({
        players: {fromSaveA: [aPlayer({id: 1})], fromSaveB: []},
        inventories: {
          fromSaveA: [{id: 10, woIds: '', size: 20}, {id: 11, woIds: '', size: 10}, {id: 50, woIds: '100', size: 35}],
          fromSaveB: [{id: 50, woIds: '200', size: 12}]
        },
        worldObjects: {
          fromSaveA: [{id: 100, gId: 'Container2', liId: 50}],
          fromSaveB: [{id: 200, gId: 'Container2', liId: 50}]
        }
      });

      // Act
      const result = resolveIdConflicts(sections);

      // Assert
      expect({
        saveAContainerLinkedInventory: result.worldObjects.fromSaveA[0]?.liId,
        saveBContainerLinkedInventory: result.worldObjects.fromSaveB[0]?.liId,
        saveBInventoryId: result.inventories.fromSaveB[0]?.id
      }).toEqual({
        saveAContainerLinkedInventory: 50,
        saveBContainerLinkedInventory: 51,
        saveBInventoryId: 51
      });
    });
  });

  describe('When a renumbered save B world object is held in a save B inventory', () => {
    it('should update the contained world object ids of that inventory only', () => {
      // Arrange
      const sections = mergedSections({
        inventories: {
          fromSaveA: [{id: 30, woIds: '100', size: 50}],
          fromSaveB: [{id: 31, woIds: '100', size: 50}]
        },
        worldObjects: {
          fromSaveA: [{id: 100, gId: 'SomeObject', liId: 30}],
          fromSaveB: [{id: 100, gId: 'OtherObject', liId: 31}]
        }
      });

      // Act
      const result = resolveIdConflicts(sections);

      // Assert
      expect({
        saveAInventoryContent: result.inventories.fromSaveA[0]?.woIds,
        saveBInventoryContent: result.inventories.fromSaveB[0]?.woIds,
        renumberedWorldObjectId: result.worldObjects.fromSaveB[0]?.id
      }).toEqual({
        saveAInventoryContent: '100',
        saveBInventoryContent: '101',
        renumberedWorldObjectId: 101
      });
    });
  });

  describe('When a save B world object is linked to a renumbered save B world object', () => {
    it('should point it at the new world object id', () => {
      // Arrange
      const sections = mergedSections({
        worldObjects: {
          fromSaveA: [{id: 100, gId: 'Lake1'}],
          fromSaveB: [{id: 100, gId: 'Lake2'}, {id: 201, gId: 'WaterGenerator', linkedWo: 100}]
        }
      });

      // Act
      const result = resolveIdConflicts(sections);

      // Assert
      expect(result.worldObjects.fromSaveB.map(worldObject => ({gId: worldObject.gId, id: worldObject.id, linkedWo: worldObject.linkedWo})))
        .toEqual([
          {gId: 'Lake2', id: 101, linkedWo: undefined},
          {gId: 'WaterGenerator', id: 201, linkedWo: 101}
        ]);
    });
  });
});
