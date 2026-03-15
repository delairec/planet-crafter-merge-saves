import { describe, it, expect} from 'bun:test';

describe('formatNumber', () => {
  it('should format number with thousands separator', () => {
    // Arrange
    const {formatNumber} = require('./formatNumber');

    // Act
    const result = formatNumber(9876543210);

    // Assert
    expect(result).toBe('9,876,543,210');
  });
});
