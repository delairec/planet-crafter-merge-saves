import {describe, expect, it} from 'bun:test';
import {formatNumberByPartsPerThresholds} from './partsPer.strategy';

const nbsp = '\u00A0';

describe('formatNumberByPartsPerThresholds', () => {
  it('should format the value with the base parts-per-quadrillion unit below the first threshold', () => {
    // Act
    const result = formatNumberByPartsPerThresholds(1);

    // Assert
    expect(result).toBe(`1${nbsp}ppq`);
  });

  it('should format the value with the largest matching unit', () => {
    // Act
    const result = formatNumberByPartsPerThresholds(1_000_000_000_000);

    // Assert
    expect(result).toBe(`1${nbsp}ppk`);
  });
});
