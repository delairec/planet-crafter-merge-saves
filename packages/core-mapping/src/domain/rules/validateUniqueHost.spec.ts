import {describe, expect, it} from 'bun:test';
import {validateUniqueHost} from './validateUniqueHost';
import {VALIDATION_ISSUE_CODES} from '../../application/ports/ValidationIssue';
import {createPlayer} from 'shared-save-processing/testing/createSaveRecords.js';

describe('validateUniqueHost', () => {

  describe('When there are no players', () => {
    it('should return no issue', () => {
      // Act
      const issues = validateUniqueHost([]);

      // Assert
      expect(issues).toEqual([]);
    });
  });

  describe('When exactly one player is host', () => {
    it('should return no issue', () => {
      // Arrange
      const players = [createPlayer({host: true}), createPlayer({host: false})];

      // Act
      const issues = validateUniqueHost(players);

      // Assert
      expect(issues).toEqual([]);
    });
  });

  describe('When no player is host', () => {
    it('should return a unique-host issue', () => {
      // Arrange
      const players = [createPlayer({host: false})];

      // Act
      const issues = validateUniqueHost(players);

      // Assert
      expect(issues).toEqual([{code: VALIDATION_ISSUE_CODES.UNIQUE_HOST, detail: 'Expected exactly one host player, found 0'}]);
    });
  });

  describe('When more than one player is host', () => {
    it('should return a unique-host issue', () => {
      // Arrange
      const players = [createPlayer({host: true}), createPlayer({host: true})];

      // Act
      const issues = validateUniqueHost(players);

      // Assert
      expect(issues).toEqual([{code: VALIDATION_ISSUE_CODES.UNIQUE_HOST, detail: 'Expected exactly one host player, found 2'}]);
    });
  });
});
