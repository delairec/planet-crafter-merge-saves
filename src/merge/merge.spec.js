import {describe, expect, it} from 'bun:test';
import {merge} from './merge.js';

describe('Merge saves', () => {
  const saveDisplayName = 'SAVE_NAME';

  it('should handle error in case of wrong save format', () => {
    // Arrange
    const {mergeSaves} = merge('invalidSaveFormatA', 'invalidSaveFormatB', saveDisplayName);

    // Act
    const result = mergeSaves();

    // Assert
    const emptySections = Array(10).fill('@\n\n').join('');
    expect(result).toBe(`ERROR_INVALID_INPUT_FORMAT\n${emptySections}@`);
  });
});

