import {describe, expect, it} from 'bun:test';
import {formatNumberByPascalThresholds} from './pascal.strategy.ts';

const nbsp = '\u00A0';

describe('formatNumberByPascalThresholds', () => {
  it('should format the value with the base nano-Pascal unit below the first threshold', () => {
    // Act
    const result = formatNumberByPascalThresholds(1);

    // Assert
    expect(result).toBe(`1${nbsp}nPa`);
  });

  it('should format the value with the largest matching unit', () => {
    // Act
    const result = formatNumberByPascalThresholds(1_000_000_000);

    // Assert
    expect(result).toBe(`1${nbsp}Pa`);
  });
});
