import {describe, expect, it} from 'bun:test';
import {formatPercentageNumber} from './percentage.strategy.ts';

describe('formatPercentageNumber', () => {
  it('should format a ratio as a rounded percentage', () => {
    // Act
    const result = formatPercentageNumber(0.1234);

    // Assert
    expect(result).toBe('12%');
  });

  it('should format a bigint value', () => {
    // Act
    const result = formatPercentageNumber(1n);

    // Assert
    expect(result).toBe('100%');
  });
});
