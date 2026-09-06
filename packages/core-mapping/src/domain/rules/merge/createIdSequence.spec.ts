import {describe, expect, it} from 'bun:test';
import {createIdSequence} from './createIdSequence';

describe('Create id sequence', () => {

  describe('When the merged save has inventories', () => {
    it('should start above the highest inventory id', () => {
      // Arrange
      const idSequence = createIdSequence([{id: 10, woIds: '', size: 20}, {id: 42, woIds: '', size: 20}]);

      // Act
      const generatedId = idSequence.next();

      // Assert
      expect(generatedId).toBe(43);
    });

    it('should hand out increasing ids', () => {
      // Arrange
      const idSequence = createIdSequence([{id: 42, woIds: '', size: 20}]);

      // Act
      const generatedIds = [idSequence.next(), idSequence.next(), idSequence.next()];

      // Assert
      expect(generatedIds).toEqual([43, 44, 45]);
    });
  });

  describe('When the merged save has no inventory', () => {
    it('should start at the first id', () => {
      // Arrange
      const noInventories: never[] = [];
      const idSequence = createIdSequence(noInventories);

      // Act
      const generatedId = idSequence.next();

      // Assert
      expect(generatedId).toBe(1);
    });
  });

  describe('When an id already in use above the sequence is reserved', () => {
    it('should move the sequence above it', () => {
      // Arrange
      const idSequence = createIdSequence([{id: 10, woIds: '', size: 20}]);

      // Act
      idSequence.reserve(500);

      // Assert
      expect(idSequence.next()).toBe(501);
    });
  });

  describe('When an id already in use below the sequence is reserved', () => {
    it('should leave the sequence untouched', () => {
      // Arrange
      const idSequence = createIdSequence([{id: 10, woIds: '', size: 20}]);

      // Act
      idSequence.reserve(5);

      // Assert
      expect(idSequence.next()).toBe(11);
    });
  });
});
