import {describe, expect, it} from 'bun:test';
import {formatNumberByThresholds, type Threshold} from './threshold.strategy.ts';

const nbsp = '\u00A0';

describe('formatNumberByThresholds', () => {
  const thresholds: Threshold[] = [
    {value: 1_000, suffix: 'k'},
    {value: 1, suffix: ''}
  ];

  it('should divide the value by the matching threshold and append its suffix', () => {
    // Act
    const result = formatNumberByThresholds(1_500, thresholds);

    // Assert
    expect(result).toBe(`1.5${nbsp}k`);
  });

  it('should use the smallest threshold suffix without dividing when the value is below every threshold', () => {
    // Act
    const result = formatNumberByThresholds(0.5, thresholds);

    // Assert
    expect(result).toBe(`0.5${nbsp}`);
  });

  it('should format a bigint value', () => {
    // Act
    const result = formatNumberByThresholds(2_000n, thresholds);

    // Assert
    expect(result).toBe(`2${nbsp}k`);
  });
});
