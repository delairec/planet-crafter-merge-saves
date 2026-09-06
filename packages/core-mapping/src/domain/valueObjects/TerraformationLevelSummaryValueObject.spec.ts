import {describe, expect, it} from 'bun:test';
import {createTerraformationLevelSummaryValueObject} from './TerraformationLevelSummaryValueObject.ts';
import {InvalidSaveDataError} from '../errors/InvalidSaveDataError.ts';

describe('TerraformationLevelSummaryValueObject', () => {
  it('should build a terraformation level summary value object from valid data', () => {
    // Arrange
    const input = {
      planetId: 'Toxicity',
      unitOxygenLevel: 100,
      unitHeatLevel: 200,
      unitPressureLevel: 300,
      unitPlantsLevel: 400,
      unitInsectsLevel: 500,
      unitAnimalsLevel: 600,
      unitPurificationLevel: 700,
      terraformationIndex: 2_800,
      biomass: 1_500
    };

    // Act
    const summary = createTerraformationLevelSummaryValueObject(input);

    // Assert
    expect(summary).toEqual(input);
  });

  it('should reject a non-finite biomass', () => {
    // Arrange
    const input = {
      planetId: 'Toxicity',
      unitOxygenLevel: 100,
      unitHeatLevel: 200,
      unitPressureLevel: 300,
      unitPlantsLevel: 400,
      unitInsectsLevel: 500,
      unitAnimalsLevel: 600,
      unitPurificationLevel: 700,
      terraformationIndex: 2_800,
      biomass: NaN
    };

    // Act & Assert
    expect(() => createTerraformationLevelSummaryValueObject(input)).toThrow(InvalidSaveDataError);
  });
});
