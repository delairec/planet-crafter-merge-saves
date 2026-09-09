import {describe, expect, it} from 'bun:test';
import {resolveIdConflicts} from './resolveIdConflicts';
import {MergedSaveSections} from './MergedSaveSections';
import {Inventory, Player, WorldObject} from 'shared-save-processing/gameDefinitions';
import {EntriesByOrigin} from './EntriesByOrigin';
import {createGlobalMetadata, createInventory, createPlayer, createWorldObject} from 'shared-save-processing/testing/createSaveRecords.js';

describe('Resolve id conflicts', () => {
  function createMergedSections(overrides: {
    players?: EntriesByOrigin<Player>,
    inventories?: EntriesByOrigin<Inventory>,
    worldObjects?: EntriesByOrigin<WorldObject>
  }): MergedSaveSections {
    return {
      globalMetadata: createGlobalMetadata(),
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
      const playerFromSaveA = createPlayer({id: '1', inventoryId: 10, equipmentId: 11});
      const playerFromSaveB = createPlayer({id: '2', inventoryId: 20, equipmentId: 21});
      const sections = createMergedSections({
        players: {fromSaveA: [playerFromSaveA], fromSaveB: [playerFromSaveB]},
        inventories: {
          fromSaveA: [createInventory({id: 10, woIds: '100', size: 20}), createInventory({id: 11, woIds: '', size: 10})],
          fromSaveB: [createInventory({id: 20, woIds: '', size: 20}), createInventory({id: 21, woIds: '', size: 10})]
        },
        worldObjects: {fromSaveA: [createWorldObject({id: 100, gId: 'SomeObject'})], fromSaveB: [createWorldObject({id: 200, gId: 'OtherObject'})]}
      });

      // Act
      const result = resolveIdConflicts(sections);

      // Assert
      expect(result.players).toEqual({fromSaveA: [playerFromSaveA], fromSaveB: [playerFromSaveB]});
      expect(result.inventories).toEqual({
        fromSaveA: [{id: 10, woIds: '100', size: 20}, {id: 11, woIds: '', size: 10}],
        fromSaveB: [{id: 20, woIds: '', size: 20}, {id: 21, woIds: '', size: 10}]
      });
      expect(result.worldObjects).toEqual({
        fromSaveA: [{id: 100, gId: 'SomeObject'}],
        fromSaveB: [{id: 200, gId: 'OtherObject'}]
      });
    });
  });

  describe('When both saves use the same identifiers', () => {
    it('should renumber the save B entries and keep every entry of both saves', () => {
      // Arrange
      const playerFromSaveA = createPlayer({id: '1', inventoryId: 10, equipmentId: 11});
      const playerFromSaveB = createPlayer({id: '1', name: 'Chileny', inventoryId: 10, equipmentId: 11});
      const sections = createMergedSections({
        players: {fromSaveA: [playerFromSaveA], fromSaveB: [playerFromSaveB]},
        inventories: {
          fromSaveA: [createInventory({id: 10, woIds: '', size: 20}), createInventory({id: 11, woIds: '', size: 10})],
          fromSaveB: [createInventory({id: 10, woIds: '', size: 35}), createInventory({id: 11, woIds: '', size: 5})]
        },
        worldObjects: {fromSaveA: [createWorldObject({id: 100, gId: 'SomeObject'})], fromSaveB: [createWorldObject({id: 100, gId: 'OtherObject'})]}
      });

      // Act
      const result = resolveIdConflicts(sections);

      // Assert
      expect(result.players).toEqual({
        fromSaveA: [playerFromSaveA],
        fromSaveB: [{...playerFromSaveB, inventoryId: 101, equipmentId: 102}]
      });
      expect(result.inventories).toEqual({
        fromSaveA: [{id: 10, woIds: '', size: 20}, {id: 11, woIds: '', size: 10}],
        fromSaveB: [{id: 101, woIds: '', size: 35}, {id: 102, woIds: '', size: 5}]
      });
      expect(result.worldObjects).toEqual({
        fromSaveA: [{id: 100, gId: 'SomeObject'}],
        fromSaveB: [{id: 103, gId: 'OtherObject'}]
      });
    });

    it('should point the save B player at its own renumbered inventory and equipment', () => {
      // Arrange
      const playerFromSaveB = createPlayer({id: '2', name: 'Chileny', inventoryId: 10, equipmentId: 11});
      const sections = createMergedSections({
        players: {fromSaveA: [createPlayer({id: '1', inventoryId: 10, equipmentId: 11})], fromSaveB: [playerFromSaveB]},
        inventories: {
          fromSaveA: [createInventory({id: 10, woIds: '', size: 20}), createInventory({id: 11, woIds: '', size: 10})],
          fromSaveB: [createInventory({id: 10, woIds: '', size: 35}), createInventory({id: 11, woIds: '', size: 5})]
        }
      });

      // Act
      const result = resolveIdConflicts(sections);

      // Assert
      expect(result.players.fromSaveB).toEqual([{...playerFromSaveB, inventoryId: 12, equipmentId: 13}]);
    });
  });

  describe('When a save B player carries the identifier of a save A player', () => {
    it('should leave that identifier untouched', () => {
      // Arrange
      const playerFromSaveA = createPlayer({id: '1', inventoryId: 10, equipmentId: 11});
      const playerFromSaveB = createPlayer({id: '1', name: 'Chileny', inventoryId: 20, equipmentId: 21});
      const sections = createMergedSections({
        players: {fromSaveA: [playerFromSaveA], fromSaveB: [playerFromSaveB]},
        inventories: {
          fromSaveA: [createInventory({id: 10, woIds: '', size: 20}), createInventory({id: 11, woIds: '', size: 10})],
          fromSaveB: [createInventory({id: 20, woIds: '', size: 35}), createInventory({id: 21, woIds: '', size: 5})]
        }
      });

      // Act
      const result = resolveIdConflicts(sections);

      // Assert
      expect(result.players).toEqual({fromSaveA: [playerFromSaveA], fromSaveB: [playerFromSaveB]});
    });
  });

  describe('When a save B player owns an inventory that no save A player owns', () => {
    it('should point that player at its own renumbered inventory rather than at the save A one', () => {
      // Arrange
      const playerFromSaveB = createPlayer({id: '2', name: 'Chileny', inventoryId: 44, equipmentId: 45});
      const sections = createMergedSections({
        players: {fromSaveA: [createPlayer({id: '1', inventoryId: 3, equipmentId: 4})], fromSaveB: [playerFromSaveB]},
        inventories: {
          fromSaveA: [createInventory({id: 3, woIds: '', size: 20}), createInventory({id: 4, woIds: '', size: 10}), createInventory({id: 44, woIds: '', size: 35}), createInventory({id: 45, woIds: '', size: 35})],
          fromSaveB: [createInventory({id: 44, woIds: '', size: 20}), createInventory({id: 45, woIds: '', size: 10})]
        }
      });

      // Act
      const result = resolveIdConflicts(sections);

      // Assert
      expect(result.players.fromSaveB).toEqual([{...playerFromSaveB, inventoryId: 46, equipmentId: 47}]);
      expect(result.inventories.fromSaveB).toEqual([{id: 46, woIds: '', size: 20}, {id: 47, woIds: '', size: 10}]);
    });
  });

  describe('When both saves have a world object linked to the same inventory id', () => {
    it('should send the save B world object to the renumbered inventory and leave the save A one on the shared id', () => {
      // Arrange
      const sections = createMergedSections({
        players: {fromSaveA: [createPlayer({id: '1', inventoryId: 10, equipmentId: 11})], fromSaveB: []},
        inventories: {
          fromSaveA: [createInventory({id: 10, woIds: '', size: 20}), createInventory({id: 11, woIds: '', size: 10}), createInventory({id: 50, woIds: '100', size: 35})],
          fromSaveB: [createInventory({id: 50, woIds: '200', size: 12})]
        },
        worldObjects: {
          fromSaveA: [createWorldObject({id: 100, gId: 'Container2', liId: 50})],
          fromSaveB: [createWorldObject({id: 200, gId: 'Container2', liId: 50})]
        }
      });

      // Act
      const result = resolveIdConflicts(sections);

      // Assert
      expect(result.worldObjects).toEqual({
        fromSaveA: [{id: 100, gId: 'Container2', liId: 50}],
        fromSaveB: [{id: 200, gId: 'Container2', liId: 201}]
      });
      expect(result.inventories.fromSaveB).toEqual([{id: 201, woIds: '200', size: 12}]);
    });
  });

  describe('When a save B inventory holds a renumbered world object', () => {
    it('should update the contents of that inventory and leave the save A one untouched', () => {
      // Arrange
      const sections = createMergedSections({
        inventories: {
          fromSaveA: [createInventory({id: 30, woIds: '100', size: 50})],
          fromSaveB: [createInventory({id: 31, woIds: '100', size: 50})]
        },
        worldObjects: {
          fromSaveA: [createWorldObject({id: 100, gId: 'Iron'})],
          fromSaveB: [createWorldObject({id: 100, gId: 'Cobalt'})]
        }
      });

      // Act
      const result = resolveIdConflicts(sections);

      // Assert
      expect(result.inventories).toEqual({
        fromSaveA: [{id: 30, woIds: '100', size: 50}],
        fromSaveB: [{id: 31, woIds: '101', size: 50}]
      });
      expect(result.worldObjects.fromSaveB).toEqual([{id: 101, gId: 'Cobalt'}]);
    });
  });

  describe('When a world object already holds the identifier that follows the highest inventory identifier', () => {
    it('should renumber the save B inventory above that world object', () => {
      // Arrange
      const sections = createMergedSections({
        inventories: {
          fromSaveA: [createInventory({id: 10, woIds: '', size: 20})],
          fromSaveB: [createInventory({id: 10, woIds: '', size: 35})]
        },
        worldObjects: {fromSaveA: [createWorldObject({id: 11, gId: 'Iron'})], fromSaveB: []}
      });

      // Act
      const result = resolveIdConflicts(sections);

      // Assert
      expect(result.inventories.fromSaveB).toEqual([{id: 12, woIds: '', size: 35}]);
      expect(result.worldObjects.fromSaveA).toEqual([{id: 11, gId: 'Iron'}]);
    });
  });

  describe('When a save B world object is linked to a renumbered save B world object', () => {
    it('should point it at the new world object id', () => {
      // Arrange
      const sections = createMergedSections({
        worldObjects: {
          fromSaveA: [createWorldObject({id: 100, gId: 'Lake1'})],
          fromSaveB: [createWorldObject({id: 100, gId: 'Lake2'}), createWorldObject({id: 201, gId: 'WaterGenerator', linkedWo: 100})]
        }
      });

      // Act
      const result = resolveIdConflicts(sections);

      // Assert
      expect(result.worldObjects.fromSaveB).toEqual([
        {id: 202, gId: 'Lake2'},
        {id: 201, gId: 'WaterGenerator', linkedWo: 202}
      ]);
    });
  });
});
