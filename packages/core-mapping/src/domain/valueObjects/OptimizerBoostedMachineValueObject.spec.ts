import {describe, expect, it} from 'bun:test';
import {createOptimizerBoostedMachineValueObject} from './OptimizerBoostedMachineValueObject.ts';
import {InvalidSaveDataError} from '../errors/InvalidSaveDataError.ts';

describe('OptimizerBoostedMachineValueObject', () => {
  it('should build an optimizer boosted machine value object from valid data', () => {
    // Arrange
    const input = {name: 'Drill0' as const, quantity: 3};

    // Act
    const boostedMachine = createOptimizerBoostedMachineValueObject(input);

    // Assert
    expect(boostedMachine).toEqual(input);
  });

  it('should reject a non-finite quantity', () => {
    // Arrange
    const input = {name: 'Drill0' as const, quantity: NaN};

    // Act & Assert
    expect(() => createOptimizerBoostedMachineValueObject(input)).toThrow(InvalidSaveDataError);
  });
});
