import {describe, expect, it} from 'bun:test';
import {createOptimizerValueObject} from './OptimizerValueObject.ts';
import {InvalidSaveDataError} from '../errors/InvalidSaveDataError.ts';

describe('OptimizerValueObject', () => {
  it('should build an optimizer value object from valid data', () => {
    // Arrange
    const input = {name: 'Optimizer1' as const, fuseCount: 2, boostedMachines: [], contribution: 150, productionRatio: 0.3};

    // Act
    const optimizer = createOptimizerValueObject(input);

    // Assert
    expect(optimizer).toEqual(input);
  });

  it('should reject a non-finite contribution', () => {
    // Arrange
    const input = {name: 'Optimizer1' as const, fuseCount: 2, boostedMachines: [], contribution: NaN};

    // Act & Assert
    expect(() => createOptimizerValueObject(input)).toThrow(InvalidSaveDataError);
  });
});
