import {describe, it, expect} from 'bun:test';
import {normalizeRawSections, LEGACY_SAVE_FORMAT_WARNING} from './normalizeRawSections.js';

describe('normalizeRawSections', () => {

  describe('When the raw parts already match the current 11-part format', () => {
    it('should return them unchanged', () => {
      // Arrange
      const rawParts = Array.from({length: 11}, (_, index) => `part${index}`);

      // Act
      const {sections} = normalizeRawSections(rawParts);

      // Assert
      expect(sections).toEqual(rawParts);
    });

    it('should report no warning', () => {
      // Arrange
      const rawParts = Array.from({length: 11}, (_, index) => `part${index}`);

      // Act
      const {warnings} = normalizeRawSections(rawParts);

      // Assert
      expect(warnings).toEqual([]);
    });
  });

  describe('When the raw parts match the legacy 12-part format (still containing Terrain Layers)', () => {
    const legacyParts = Array.from({length: 12}, (_, index) => `part${index}`);

    it('should drop the Terrain Layers part and shift World Events and the trailing part up by one index', () => {
      // Act
      const {sections} = normalizeRawSections(legacyParts);

      // Assert
      expect(sections).toEqual([
        'part0', 'part1', 'part2', 'part3', 'part4',
        'part5', 'part6', 'part7', 'part8', 'part10', 'part11'
      ]);
    });

    it('should report the legacy-save-format warning code', () => {
      // Act
      const {warnings} = normalizeRawSections(legacyParts);

      // Assert
      expect(warnings).toEqual([LEGACY_SAVE_FORMAT_WARNING]);
    });
  });

  describe('When the raw parts match neither the current nor the legacy format', () => {
    it('should return them unchanged', () => {
      // Arrange
      const rawParts = ['part0', 'part1'];

      // Act
      const {sections} = normalizeRawSections(rawParts);

      // Assert
      expect(sections).toEqual(rawParts);
    });

    it('should report no warning', () => {
      // Arrange
      const rawParts = ['part0', 'part1'];

      // Act
      const {warnings} = normalizeRawSections(rawParts);

      // Assert
      expect(warnings).toEqual([]);
    });
  });
});
