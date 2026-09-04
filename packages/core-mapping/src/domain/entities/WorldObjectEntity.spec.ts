import {describe, expect, it} from 'bun:test';
import {createWorldObjectEntity} from './WorldObjectEntity';
import {InvalidSaveDataError} from '../errors/InvalidSaveDataError';

describe('WorldObjectEntity', () => {
  it('should build a world object entity from valid data', () => {
    // Arrange
    const input = {id: '1', name: 'Drill0' as const};

    // Act
    const worldObject = createWorldObjectEntity(input);

    // Assert
    expect(worldObject).toEqual(input);
  });

  it('should reject an empty id', () => {
    // Arrange
    const input = {id: '', name: 'Drill0' as const};

    // Act & Assert
    expect(() => createWorldObjectEntity(input)).toThrow(InvalidSaveDataError);
  });
});
