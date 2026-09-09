import {describe, expect, it} from 'bun:test';
import {formatErrorLocation} from './formatErrorLocation';
import {
  GLOBAL_METADATA_SECTION_INDEX,
  INVENTORIES_SECTION_INDEX,
  MAILBOX_MESSAGES_SECTION_INDEX,
  PLAYERS_SECTION_INDEX,
  SAVE_CONFIGURATION_SECTION_INDEX,
  STATISTICS_SECTION_INDEX,
  STORY_EVENTS_SECTION_INDEX,
  TERRAFORMATION_LEVELS_SECTION_INDEX,
  WORLD_EVENTS_SECTION_INDEX,
  WORLD_OBJECTS_SECTION_INDEX
} from 'shared-save-processing/sectionIndexes.js';

describe('formatErrorLocation', () => {

  describe('When the error was found in a save entry', () => {
    it('should name the section and the entry', () => {
      // Act
      const location = formatErrorLocation({section: PLAYERS_SECTION_INDEX, entryIndex: 3});

      // Assert
      expect(location).toBe('Players (section 2), entry 3');
    });
  });

  describe('When the error concerns the whole file', () => {
    it('should report no location at all', () => {
      // Arrange
      const errorWithoutLocation = {};

      // Act
      const location = formatErrorLocation(errorWithoutLocation);

      // Assert
      expect(location).toBeNull();
    });
  });

  describe('When the error names a section but no entry', () => {
    it('should name the section alone', () => {
      // Act
      const location = formatErrorLocation({section: GLOBAL_METADATA_SECTION_INDEX});

      // Assert
      expect(location).toBe('Global metadata (section 0)');
    });
  });

  describe('When the section has no label', () => {
    it('should fall back to the bare section index', () => {
      // Arrange
      const sectionOutsideTheSaveFormat = 42;

      // Act
      const location = formatErrorLocation({section: sectionOutsideTheSaveFormat, entryIndex: 1});

      // Assert
      expect(location).toBe('section 42, entry 1');
    });
  });

  describe('When every save section is located', () => {
    it('should leave none of them on the bare section index', () => {
      // Arrange
      const everySaveSectionIndex = [
        GLOBAL_METADATA_SECTION_INDEX,
        TERRAFORMATION_LEVELS_SECTION_INDEX,
        PLAYERS_SECTION_INDEX,
        WORLD_OBJECTS_SECTION_INDEX,
        INVENTORIES_SECTION_INDEX,
        STATISTICS_SECTION_INDEX,
        MAILBOX_MESSAGES_SECTION_INDEX,
        STORY_EVENTS_SECTION_INDEX,
        SAVE_CONFIGURATION_SECTION_INDEX,
        WORLD_EVENTS_SECTION_INDEX
      ];

      // Act
      const sectionsWithoutOwnLabel = everySaveSectionIndex
        .filter(section => formatErrorLocation({section}) === `section ${section}`);

      // Assert
      expect<number[]>(sectionsWithoutOwnLabel).toEqual([]);
    });
  });
});
