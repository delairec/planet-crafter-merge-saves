import {describe, expect, it} from 'bun:test';
import {resolveWorldObjectIdConflicts} from './resolveWorldObjectIdConflicts';
import {createIdSequence} from './createIdSequence';

describe('Resolve world object id conflicts', () => {
  const anInventory = {id: 10, woIds: '', size: 20};

  describe('When a save B world object uses an id already taken in save A', () => {
    it('should give that world object a new id', () => {
      // Arrange
      const worldObjects = {
        fromSaveA: [{id: 100, gId: 'SomeObject'}],
        fromSaveB: [{id: 100, gId: 'OtherObject'}]
      };

      // Act
      const result = resolveWorldObjectIdConflicts(worldObjects, createIdSequence([anInventory]));

      // Assert
      expect(result.entries.fromSaveB).toEqual([{id: 101, gId: 'OtherObject'}]);
    });

    it('should report the new id under the id it replaces', () => {
      // Arrange
      const worldObjects = {
        fromSaveA: [{id: 100, gId: 'SomeObject'}],
        fromSaveB: [{id: 100, gId: 'OtherObject'}]
      };

      // Act
      const result = resolveWorldObjectIdConflicts(worldObjects, createIdSequence([anInventory]));

      // Assert
      expect(result.saveBIdRemapping).toEqual(new Map([[100, 101]]));
    });

    it('should leave the save A world objects untouched', () => {
      // Arrange
      const worldObjects = {
        fromSaveA: [{id: 100, gId: 'SomeObject'}],
        fromSaveB: [{id: 100, gId: 'OtherObject'}]
      };

      // Act
      const result = resolveWorldObjectIdConflicts(worldObjects, createIdSequence([anInventory]));

      // Assert
      expect(result.entries.fromSaveA).toEqual([{id: 100, gId: 'SomeObject'}]);
    });
  });

  describe('When a world object id is far above the inventory ids', () => {
    it('should generate an id that does not collide with any world object already walked', () => {
      // Arrange
      const worldObjects = {
        fromSaveA: [{id: 500, gId: 'SomeObject'}],
        fromSaveB: [{id: 500, gId: 'OtherObject'}]
      };

      // Act
      const result = resolveWorldObjectIdConflicts(worldObjects, createIdSequence([anInventory]));

      // Assert
      expect(result.entries.fromSaveB).toEqual([{id: 501, gId: 'OtherObject'}]);
    });
  });

  describe('When a save B world object uses an id that is free', () => {
    it('should keep its id and report no remapping', () => {
      // Arrange
      const worldObjects = {
        fromSaveA: [{id: 100, gId: 'SomeObject'}],
        fromSaveB: [{id: 200, gId: 'OtherObject'}]
      };

      // Act
      const result = resolveWorldObjectIdConflicts(worldObjects, createIdSequence([anInventory]));

      // Assert
      expect(result.entries.fromSaveB).toEqual([{id: 200, gId: 'OtherObject'}]);
      expect(result.saveBIdRemapping).toEqual(new Map());
    });
  });
});
