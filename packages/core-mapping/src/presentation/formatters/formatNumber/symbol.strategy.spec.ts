import {describe, expect, it} from 'bun:test';
import {formatNumberByUnitThresholds} from './symbol.strategy.ts';

const nbsp = '\u00A0';

describe('formatNumberByUnitThresholds', () => {
  describe('When the value is at or above the kilo threshold', () => {
    it('should format the value with the matching unit symbol and keep the decimals', () => {
      // Act
      const result = formatNumberByUnitThresholds(1_500);

      // Assert
      expect(result).toBe(`1.5${nbsp}k`);
    });
  });

  describe('When the value is between 0.001 and 999', () => {
    it('should format the value without a unit symbol', () => {
      // Act
      const result = formatNumberByUnitThresholds(439);

      // Assert
      expect(result).toBe(`439${nbsp}`);
    });
  });

  describe('When the value is below one but above the smallest multiply threshold', () => {
    it('should multiply the value to bring it into the unit range and append the matching symbol', () => {
      // Act
      const result = formatNumberByUnitThresholds(0.000_001);

      // Assert
      expect(result).toBe(`1${nbsp}µ`);
    });
  });

  describe('When the value is below every threshold', () => {
    it('should fall back to no unit symbol', () => {
      // Act
      const result = formatNumberByUnitThresholds(0.000_000_000_000_000_1);

      // Assert
      expect(result).toBe(`0${nbsp}`);
    });
  });

  describe('When the value is a bigint at or above the yotta threshold', () => {
    it('should format the value with the matching unit symbol', () => {
      // Act
      const result = formatNumberByUnitThresholds(1_000_000_000_000_000_000_000_000n);

      // Assert
      expect(result).toBe(`1${nbsp}Y`);
    });
  });

  describe('When the value is a bigint below the bigint thresholds', () => {
    it('should format the value with the matching unit symbol and drop the decimals', () => {
      // Act
      const result = formatNumberByUnitThresholds(1_500n);

      // Assert
      expect(result).toBe(`1${nbsp}k`);
    });
  });
});
