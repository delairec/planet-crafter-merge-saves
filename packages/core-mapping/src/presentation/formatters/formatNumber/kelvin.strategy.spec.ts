import {describe, expect, it} from 'bun:test';
import {formatNumberByKelvinThresholds} from './kelvin.strategy.ts';

const nbsp = '\u00A0';

describe('formatNumberByKelvinThresholds', () => {
  it('should format the value with the base pico-Kelvin unit below the first threshold', () => {
    // Act
    const result = formatNumberByKelvinThresholds(1);

    // Assert
    expect(result).toBe(`1${nbsp}pK`);
  });

  it('should format the value with the largest matching unit', () => {
    // Act
    const result = formatNumberByKelvinThresholds(1_000_000_000_000);

    // Assert
    expect(result).toBe(`1${nbsp}K`);
  });
});
