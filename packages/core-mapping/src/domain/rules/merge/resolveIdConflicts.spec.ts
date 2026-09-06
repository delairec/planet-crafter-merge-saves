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

  function createPlayer(overrides: Partial<Player>): Player {
    return {...basePlayer, id: 1, inventoryId: 10, equipmentId: 11, ...overrides};
  }

  function createMergedSections(overrides: {
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
      const playerFromSaveA = createPlayer({id: 1});
      const playerFromSaveB = createPlayer({id: 2, inventoryId: 20, equipmentId: 21});
      const sections = createMergedSections({
        players: {fromSaveA: [playerFromSaveA], fromSaveB: [playerFromSaveB]},
        inventories: {
          fromSaveA: [{id: 10, woIds: '100', size: 20}, {id: 11, woIds: '', size: 10}],
          fromSaveB: [{id: 20, woIds: '', size: 20}, {id: 21, woIds: '', size: 10}]
        },
        worldObjects: {fromSaveA: [{id: 100, gId: 'SomeObject'}], fromSaveB: [{id: 200, gId: 'OtherObject'}]}
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
      const playerFromSaveA = createPlayer({id: 1});
      const playerFromSaveB = createPlayer({id: 1, name: 'Chileny'});
      const sections = createMergedSections({
        players: {fromSaveA: [playerFromSaveA], fromSaveB: [playerFromSaveB]},
        inventories: {
          fromSaveA: [{id: 10, woIds: '', size: 20}, {id: 11, woIds: '', size: 10}],
          fromSaveB: [{id: 10, woIds: '', size: 35}, {id: 11, woIds: '', size: 5}]
        },
        worldObjects: {fromSaveA: [{id: 100, gId: 'SomeObject'}], fromSaveB: [{id: 100, gId: 'OtherObject'}]}
      });

      // Act
      const result = resolveIdConflicts(sections);

      // Assert
      expect(result.players).toEqual({
        fromSaveA: [playerFromSaveA],
        fromSaveB: [{...playerFromSaveB, id: 12, inventoryId: 13, equipmentId: 14}]
      });
      expect(result.inventories).toEqual({
        fromSaveA: [{id: 10, woIds: '', size: 20}, {id: 11, woIds: '', size: 10}],
        fromSaveB: [{id: 13, woIds: '', size: 35}, {id: 14, woIds: '', size: 5}]
      });
      expect(result.worldObjects).toEqual({
        fromSaveA: [{id: 100, gId: 'SomeObject'}],
        fromSaveB: [{id: 101, gId: 'OtherObject'}]
      });
    });

    it('should point the save B player at its own renumbered inventory and equipment', () => {
      // Arrange
      const playerFromSaveB = createPlayer({id: 2, name: 'Chileny'});
      const sections = createMergedSections({
        players: {fromSaveA: [createPlayer({id: 1})], fromSaveB: [playerFromSaveB]},
        inventories: {
          fromSaveA: [{id: 10, woIds: '', size: 20}, {id: 11, woIds: '', size: 10}],
          fromSaveB: [{id: 10, woIds: '', size: 35}, {id: 11, woIds: '', size: 5}]
        }
      });

      // Act
      const result = resolveIdConflicts(sections);

      // Assert
      expect(result.players.fromSaveB).toEqual([{...playerFromSaveB, inventoryId: 12, equipmentId: 13}]);
    });
  });

  describe('When a save B player owns an inventory that no save A player owns', () => {
    it('should point that player at its own renumbered inventory rather than at the save A one', () => {
      // Arrange
      const playerFromSaveB = createPlayer({id: 2, name: 'Rrose', inventoryId: 44, equipmentId: 45});
      const sections = createMergedSections({
        players: {fromSaveA: [createPlayer({id: 1, inventoryId: 3, equipmentId: 4})], fromSaveB: [playerFromSaveB]},
        inventories: {
          fromSaveA: [{id: 3, woIds: '', size: 20}, {id: 4, woIds: '', size: 10}, {id: 44, woIds: '', size: 35}, {id: 45, woIds: '', size: 35}],
          fromSaveB: [{id: 44, woIds: '', size: 20}, {id: 45, woIds: '', size: 10}]
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
        players: {fromSaveA: [createPlayer({id: 1})], fromSaveB: []},
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
      expect(result.worldObjects).toEqual({
        fromSaveA: [{id: 100, gId: 'Container2', liId: 50}],
        fromSaveB: [{id: 200, gId: 'Container2', liId: 51}]
      });
      expect(result.inventories.fromSaveB).toEqual([{id: 51, woIds: '200', size: 12}]);
    });
  });

  describe('When a save B inventory holds a renumbered world object', () => {
    it('should update the contents of that inventory and leave the save A one untouched', () => {
      // Arrange
      const sections = createMergedSections({
        inventories: {
          fromSaveA: [{id: 30, woIds: '100', size: 50}],
          fromSaveB: [{id: 31, woIds: '100', size: 50}]
        },
        worldObjects: {
          fromSaveA: [{id: 100, gId: 'Iron'}],
          fromSaveB: [{id: 100, gId: 'Cobalt'}]
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

  describe('When a save B world object is linked to a renumbered save B world object', () => {
    it('should point it at the new world object id', () => {
      // Arrange
      const sections = createMergedSections({
        worldObjects: {
          fromSaveA: [{id: 100, gId: 'Lake1'}],
          fromSaveB: [{id: 100, gId: 'Lake2'}, {id: 201, gId: 'WaterGenerator', linkedWo: 100}]
        }
      });

      // Act
      const result = resolveIdConflicts(sections);

      // Assert
      expect(result.worldObjects.fromSaveB).toEqual([
        {id: 101, gId: 'Lake2'},
        {id: 201, gId: 'WaterGenerator', linkedWo: 101}
      ]);
    });
  });
});
