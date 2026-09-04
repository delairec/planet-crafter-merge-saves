import {describe, expect, it} from 'bun:test';
import {createPlayerEntity} from './PlayerEntity';
import {InvalidSaveDataError} from '../errors/InvalidSaveDataError';

describe('PlayerEntity', () => {
  it('should build a player entity from valid data', () => {
    // Arrange
    const input = {name: 'Nikowa', inventory: ['Backpack4'], equipment: ['OxygenTank5']};

    // Act
    const player = createPlayerEntity(input);

    // Assert
    expect(player).toEqual(input);
  });

  it('should reject an empty name', () => {
    // Arrange
    const input = {name: '', inventory: [], equipment: []};

    // Act & Assert
    expect(() => createPlayerEntity(input)).toThrow(InvalidSaveDataError);
  });
});
