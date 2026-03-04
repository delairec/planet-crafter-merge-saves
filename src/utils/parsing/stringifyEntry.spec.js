import {describe, it, expect} from 'bun:test';
import {stringifyEntry} from './stringifyEntry.js';

describe('stringifyEntry', () => {
  describe('When a gauge or level field has a whole number value', () => {
    it('should preserve the decimal notation for playerGaugeOxygen', () => {
      // Arrange
      const entry = {playerGaugeOxygen: 280};

      // Act
      const result = stringifyEntry(entry);

      // Assert
      expect(result).toBe('{"playerGaugeOxygen":280.0}');
    });

    it('should preserve the decimal notation for playerGaugeToxic', () => {
      // Arrange
      const entry = {playerGaugeToxic: 0};

      // Act
      const result = stringifyEntry(entry);

      // Assert
      expect(result).toBe('{"playerGaugeToxic":0.0}');
    });

    it('should preserve the decimal notation for playerGaugeThirst', () => {
      // Arrange
      const entry = {playerGaugeThirst: 100};

      // Act
      const result = stringifyEntry(entry);

      // Assert
      expect(result).toBe('{"playerGaugeThirst":100.0}');
    });

    it('should preserve the decimal notation for playerGaugeHealth', () => {
      // Arrange
      const entry = {playerGaugeHealth: 72};

      // Act
      const result = stringifyEntry(entry);

      // Assert
      expect(result).toBe('{"playerGaugeHealth":72.0}');
    });

    it('should preserve the decimal notation for unitOxygenLevel', () => {
      // Arrange
      const entry = {unitOxygenLevel: 2477136019456};

      // Act
      const result = stringifyEntry(entry);

      // Assert
      expect(result).toBe('{"unitOxygenLevel":2477136019456.0}');
    });

    it('should preserve the decimal notation for unitHeatLevel', () => {
      // Arrange
      const entry = {unitHeatLevel: 2219597103104};

      // Act
      const result = stringifyEntry(entry);

      // Assert
      expect(result).toBe('{"unitHeatLevel":2219597103104.0}');
    });

    it('should preserve the decimal notation for unitPurificationLevel', () => {
      // Arrange
      const entry = {unitPurificationLevel: 0};

      // Act
      const result = stringifyEntry(entry);

      // Assert
      expect(result).toBe('{"unitPurificationLevel":0.0}');
    });

    it('should preserve the decimal notation for hunger', () => {
      // Arrange
      const entry = {hunger: -100};

      // Act
      const result = stringifyEntry(entry);

      // Assert
      expect(result).toBe('{"hunger":-100.0}');
    });
  });

  describe('When a gauge or level field already has a fractional value', () => {
    it('should serialize it as-is', () => {
      // Arrange
      const entry = {playerGaugeThirst: 96.3858642578125};

      // Act
      const result = stringifyEntry(entry);

      // Assert
      expect(result).toBe('{"playerGaugeThirst":96.3858642578125}');
    });
  });

  describe('When a field is not a gauge or level field', () => {
    it('should serialize integer values without decimal notation', () => {
      // Arrange
      const entry = {id: 42};

      // Act
      const result = stringifyEntry(entry);

      // Assert
      expect(result).toBe('{"id":42}');
    });

    it('should serialize string values normally', () => {
      // Arrange
      const entry = {name: 'Nikowa'};

      // Act
      const result = stringifyEntry(entry);

      // Assert
      expect(result).toBe('{"name":"Nikowa"}');
    });
  });

  describe('When entry has mixed fields', () => {
    it('should apply decimal notation only to known gauge and level fields', () => {
      // Arrange
      const entry = {id: 1, playerGaugeOxygen: 370, playerGaugeThirst: 99.9, host: true};

      // Act
      const result = stringifyEntry(entry);

      // Assert
      expect(result).toBe('{"id":1,"playerGaugeOxygen":370.0,"playerGaugeThirst":99.9,"host":true}');
    });
  });
});
