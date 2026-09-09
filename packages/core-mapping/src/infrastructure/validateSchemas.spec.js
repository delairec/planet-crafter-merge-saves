import {describe, expect, it} from 'bun:test';
import {validateSchemas, validateSectionEntry} from './validateSchemas.js';
import {VALIDATION_ISSUE_CODES} from '../application/ports/ValidationIssue.ts';
import {PLAYERS_SECTION_INDEX, STATISTICS_SECTION_INDEX, WORLD_OBJECTS_SECTION_INDEX} from 'shared-save-processing/sectionIndexes.js';
import {createFakeParsedSave} from 'shared-save-processing/testing/createFakeParsedSave.js';
import {createPlayer, createWorldObject} from 'shared-save-processing/testing/createSaveRecords.js';

describe('validateSchemas', () => {

  describe('When a section entry matches its schema', () => {
    it('should return no issue', () => {
      // Arrange
      const {sections} = createFakeParsedSave({players: [createPlayer()]});

      // Act
      const issues = validateSchemas(sections);

      // Assert
      expect(issues).toEqual([]);
    });
  });

  describe('When a section entry violates its schema', () => {
    it('should return a schema-violation issue located at its section and entry index', () => {
      // Arrange
      const {name: _, ...playerWithoutName} = createPlayer();
      // @ts-expect-error intentionally missing the required name to test validation
      const {sections} = createFakeParsedSave({players: [playerWithoutName]});

      // Act
      const issues = validateSchemas(sections);

      // Assert
      expect(issues).toMatchObject([
        {code: VALIDATION_ISSUE_CODES.SCHEMA_VIOLATION, section: PLAYERS_SECTION_INDEX, entryIndex: 0}
      ]);
    });
  });

  describe('When a section holding entries did not reach it as a list', () => {
    it('should fail instead of reading it as a section without a single entry', () => {
      // Arrange
      const {sections} = createFakeParsedSave();
      // @ts-expect-error a section the reader always fills, emptied on purpose to reach the guard
      sections[STATISTICS_SECTION_INDEX] = undefined;

      // Act
      const validating = () => validateSchemas(sections);

      // Assert
      expect(validating).toThrow('Unexpected save data: section 5 should hold a list of entries, received undefined.');
    });
  });
});

describe('validateSectionEntry', () => {

  describe('When a world object matches the schema of its section', () => {
    it('should return no issue for a DNA sequence whose hunger is negative', () => {
      // Arrange
      const dnaSequence = createWorldObject({id: 2481, gId: 'DNASequence', hunger: -100, grwth: 3});

      // Act
      const issues = validateSectionEntry(WORLD_OBJECTS_SECTION_INDEX, dnaSequence, 0);

      // Assert
      expect(issues).toEqual([]);
    });

    it('should return no issue for an exchange platform naming the planet of its linked inventory', () => {
      // Arrange
      const exchangePlatform = createWorldObject({
        id: 2423, gId: 'InterplanetaryExchangePlatform1', pos: '1,2,3', planet: -1140328421, liId: 2422, liPlanet: -1291310150
      });

      // Act
      const issues = validateSectionEntry(WORLD_OBJECTS_SECTION_INDEX, exchangePlatform, 0);

      // Assert
      expect(issues).toEqual([]);
    });
  });

  describe('When a world object violates the schema of its section', () => {
    it('should return a schema-violation issue located at the world objects section and the position of the entry', () => {
      // Arrange
      const {gId: _, ...worldObjectWithoutGameId} = createWorldObject();
      const positionInTheSection = 4;

      // Act
      const issues = validateSectionEntry(WORLD_OBJECTS_SECTION_INDEX, worldObjectWithoutGameId, positionInTheSection);

      // Assert
      expect(issues).toMatchObject([
        {code: VALIDATION_ISSUE_CODES.SCHEMA_VIOLATION, section: WORLD_OBJECTS_SECTION_INDEX, entryIndex: positionInTheSection}
      ]);
    });
  });
});
