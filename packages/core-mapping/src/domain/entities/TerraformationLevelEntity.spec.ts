import {describe, expect, it} from 'bun:test';
import {createTerraformationLevelEntity} from './TerraformationLevelEntity.ts';
import {InvalidSaveDataError} from '../errors/InvalidSaveDataError.ts';

describe('TerraformationLevelEntity', () => {
  it('should build a terraformation level entity from valid data', () => {
    // Arrange
    const input = {
      planetId: 'Toxicity',
      unitOxygenLevel: 100,
      unitHeatLevel: 200,
      unitPressureLevel: 300,
      unitPlantsLevel: 400,
      unitInsectsLevel: 500,
      unitAnimalsLevel: 600,
      unitPurificationLevel: 700
    };

    // Act
    const level = createTerraformationLevelEntity(input);

    // Assert
    expect(level).toEqual(input);
  });

  it('should reject a non-finite unit level', () => {
    // Arrange
    const input = {
      planetId: 'Toxicity',
      unitOxygenLevel: NaN,
      unitHeatLevel: 200,
      unitPressureLevel: 300,
      unitPlantsLevel: 400,
      unitInsectsLevel: 500,
      unitAnimalsLevel: 600,
      unitPurificationLevel: 700
    };

    // Act & Assert
    expect(() => createTerraformationLevelEntity(input)).toThrow(InvalidSaveDataError);
  });
});
