import {describe, expect, it} from 'bun:test';
import {resolvePlayerIdConflicts} from './resolvePlayerIdConflicts';
import {createIdSequence} from './createIdSequence';
import {Player} from 'shared-save-processing/gameDefinitions';

describe('Resolve player id conflicts', () => {
  const basePlayer = {
    name: 'Nikowa',
    inventoryId: 10,
    equipmentId: 11,
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

  function createPlayer(id: number, name: string): Player {
    return {...basePlayer, id, name};
  }

  const createIdSequenceStartingAt51 = () => createIdSequence([{id: 50, woIds: '', size: 20}]);

  describe('When a save B player uses an id already taken in save A', () => {
    it('should give that player a new id', () => {
      // Arrange
      const players = {fromSaveA: [createPlayer(1, 'Nikowa')], fromSaveB: [createPlayer(1, 'Chileny')]};

      // Act
      const result = resolvePlayerIdConflicts(players, createIdSequenceStartingAt51());

      // Assert
      expect(result.entries.fromSaveB.map(player => ({id: player.id, name: player.name})))
        .toEqual([{id: 51, name: 'Chileny'}]);
    });

    it('should report the new id under the id it replaces', () => {
      // Arrange
      const players = {fromSaveA: [createPlayer(1, 'Nikowa')], fromSaveB: [createPlayer(1, 'Chileny')]};

      // Act
      const result = resolvePlayerIdConflicts(players, createIdSequenceStartingAt51());

      // Assert
      expect([...result.saveBIdRemapping]).toEqual([[1, 51]]);
    });

    it('should leave the save A player untouched', () => {
      // Arrange
      const players = {fromSaveA: [createPlayer(1, 'Nikowa')], fromSaveB: [createPlayer(1, 'Chileny')]};

      // Act
      const result = resolvePlayerIdConflicts(players, createIdSequenceStartingAt51());

      // Assert
      expect(result.entries.fromSaveA.map(player => player.id)).toEqual([1]);
    });
  });

  describe('When save B players use ids that are free', () => {
    it('should keep their ids and report no remapping', () => {
      // Arrange
      const players = {fromSaveA: [createPlayer(1, 'Nikowa')], fromSaveB: [createPlayer(2, 'Chileny')]};

      // Act
      const result = resolvePlayerIdConflicts(players, createIdSequenceStartingAt51());

      // Assert
      expect({
        savedBIds: result.entries.fromSaveB.map(player => player.id),
        remapping: [...result.saveBIdRemapping]
      }).toEqual({savedBIds: [2], remapping: []});
    });
  });
});
