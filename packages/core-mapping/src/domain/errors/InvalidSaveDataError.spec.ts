import {describe, expect, it} from 'bun:test';
import {InvalidSaveDataError} from './InvalidSaveDataError.ts';

describe('InvalidSaveDataError', () => {
  it('should carry the given message', () => {
    // Arrange
    const message = 'PlayerEntity.name must be a non-empty string, received ';

    // Act
    const error = new InvalidSaveDataError(message);

    // Assert
    expect(error.message).toBe(message);
  });

  it('should be an instance of Error', () => {
    // Act
    const error = new InvalidSaveDataError('invalid data');

    // Assert
    expect(error).toBeInstanceOf(Error);
  });
});
