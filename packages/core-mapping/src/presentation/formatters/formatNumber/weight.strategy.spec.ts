import {describe, expect, it} from 'bun:test';
import {formatNumberByWeightThresholds} from './weight.strategy';

const nbsp = '\u00A0';

describe('formatNumberByWeightThresholds', () => {
  it('should format the value with the base gram unit below the first threshold', () => {
    // Act
    const result = formatNumberByWeightThresholds(1);

    // Assert
    expect(result).toBe(`1${nbsp}g`);
  });

  it('should format the value with the largest matching unit', () => {
    // Act
    const result = formatNumberByWeightThresholds(1_000_000_000_000_000);

    // Assert
    expect(result).toBe(`1${nbsp}Gt`);
  });
});
