import { describe, it, expect} from 'bun:test';
import {formatNumber, FormatNumberStrategies} from "./formatNumber";

describe('formatNumber', () => {

  it.each([
    {symbol:'n', value: 0.000_000_001},
    {symbol:'µ', value: 0.000_001},
    {symbol:'k', value: 1000},
    {symbol:'M', value: 1000_000},
    {symbol:'G', value: 1000_000_000},
    {symbol:'G', value: 1000_000_000},
    {symbol:'T', value: 1000_000_000_000},
    {symbol:'P', value: 1000_000_000_000_000},
    {symbol:'E', value: 1000_000_000_000_000_000n},
    {symbol:'Z', value: 1000_000_000_000_000_000_000n},
    {symbol:'Y', value: 1000_000_000_000_000_000_000_000n},
  ])('should format number with $symbol unit symbol', ({symbol, value}) => {
    // Act
    const result = formatNumber(value, FormatNumberStrategies.SYMBOL);

    // Assert
    expect(result).toBe(`1${symbol}`);
  });

  it('should handle big values that are not bigint type', () => {
    // Act
    const result = formatNumber(1_987_487_654_321_885, FormatNumberStrategies.SYMBOL);

    // Assert
    expect(result).toBe('1.987P');
  });

  it('should handle non integer numbers', () => {
    // Act
    const result = formatNumber(3210.52039, FormatNumberStrategies.SYMBOL);

    // Assert
    expect(result).toBe('3.211k');
  });

  describe('When number is between 0.001 and 999', () => {
    it.each([0.001, 999, 439])('should format the number %p without symbol', (number) => {
      // Act
      const result = formatNumber(number, FormatNumberStrategies.SYMBOL);

      // Assert
      expect(result).toBe(`${number}`);
    });
  });

  describe('When formatting strategy is THOUSANDS_SEPARATOR', () => {
    it('should format the number with thousands separator', () => {
      // Act
      const result = formatNumber(1_234_567, FormatNumberStrategies.THOUSANDS_SEPARATOR);

      // Assert
      expect(result).toBe('1,234,567');
    });
  });

  describe('When formatting strategy is not provided', () => {
    it('should default to thousands separator', () => {
      // Act
      const result = formatNumber(1_234_567, FormatNumberStrategies.THOUSANDS_SEPARATOR);

      // Assert
      expect(result).toBe('1,234,567');
    });
  });

  describe('When using SYMBOL strategy', () => {
    describe('When the number to format is not handled', () => {
      it('should fallback to default strategy', () => {
        // Act
        const result = formatNumber(0.000_000_000_1, FormatNumberStrategies.SYMBOL);

        // Assert
        expect(result).toBe('0');
      });
    });
  });
});
