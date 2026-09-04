import {describe, expect, it} from 'bun:test';
import {formatDecimalNumber} from './thousandsSeparator.strategy';

describe('formatDecimalNumber', () => {
  it('should format the number with a thousands separator', () => {
    // Act
    const result = formatDecimalNumber(1_234_567);

    // Assert
    expect(result).toBe('1,234,567');
  });

  it('should round the number to at most three decimal digits', () => {
    // Act
    const result = formatDecimalNumber(1.23456);

    // Assert
    expect(result).toBe('1.235');
  });

  it('should format a bigint value', () => {
    // Act
    const result = formatDecimalNumber(1_000n);

    // Assert
    expect(result).toBe('1,000');
  });
});
