import { describe, it, expect} from 'bun:test';
import {formatNumber} from "./formatNumber";

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
    // Arrange
    const {formatNumber} = require('./formatNumber');

    // Act
    const result = formatNumber(value);

    // Assert
    expect(result).toBe(`1${symbol}`);
  });

  it('should handle big values that are not bigint type', () => {
    // Arrange
    const {formatNumber} = require('./formatNumber');

    // Act
    const result = formatNumber(1_987_487_654_321_885);

    // Assert
    expect(result).toBe('1P');
  });

  it('should handle non integer numbers', () => {
    // Arrange
    const {formatNumber} = require('./formatNumber');

    // Act
    const result = formatNumber(3210.52039);

    // Assert
    expect(result).toBe('3.211k');
  });

  describe('When number is between 0.001 and 999', () => {
    it.each([0.001, 999, 439])('should format the number %p without symbol', (number) => {
      // Arrange
      const {formatNumber} = require('./formatNumber');

      // Act
      const result = formatNumber(number);

      // Assert
      expect(result).toBe(`${number}`);
    });
  });
});
