import {describe, expect, it} from 'bun:test';
import {validateSchemas} from './validateSchemas.js';
import {VALIDATION_ISSUE_CODES} from '../application/ports/ValidationIssue.ts';

describe('validateSchemas', () => {

  describe('When a section entry matches its schema', () => {
    it('should return no issue', () => {
      // Arrange
      const parsedSections = [];
      parsedSections[2] = [{
        id: 1, name: 'Player', inventoryId: 1, equipmentId: 2,
        playerPosition: '0,0,0', playerRotation: '0,0,0,1',
        playerGaugeOxygen: 1.0, playerGaugeThirst: 1.0, playerGaugeHealth: 1.0, playerGaugeToxic: 1.0,
        host: true, planetId: 'Prime'
      }];

      // Act
      const issues = validateSchemas(parsedSections);

      // Assert
      expect(issues).toEqual([]);
    });
  });

  describe('When a section entry violates its schema', () => {
    it('should return a schema-violation issue located at its section and entry index', () => {
      // Arrange
      const parsedSections = [];
      parsedSections[2] = [{}];

      // Act
      const issues = validateSchemas(parsedSections);

      // Assert
      expect(issues).toMatchObject([
        {code: VALIDATION_ISSUE_CODES.SCHEMA_VIOLATION, section: 2, entryIndex: 0}
      ]);
    });
  });
});
