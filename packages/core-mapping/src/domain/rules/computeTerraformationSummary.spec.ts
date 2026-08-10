import {describe, expect, it} from 'bun:test';
import {computeTerraformationSummary} from './computeTerraformationSummary';
import {TerraformationLevelEntity} from '../entities/TerraformationLevelEntity';

describe('computeTerraformationSummary', () => {
  it('should sum plant, insect and animal levels into the biomass', () => {
    // Arrange
    const level: TerraformationLevelEntity = {
      planetId: 'Earth',
      unitOxygenLevel: 0,
      unitHeatLevel: 0,
      unitPressureLevel: 0,
      unitPurificationLevel: 0,
      unitPlantsLevel: 101_101,
      unitInsectsLevel: 112_112,
      unitAnimalsLevel: 131_131
    };

    // Act
    const {biomass} = computeTerraformationSummary(level);

    // Assert
    expect(biomass).toBe(344_344);
  });

  it('should sum environmental levels and biomass into the terraformation index', () => {
    // Arrange
    const level: TerraformationLevelEntity = {
      planetId: 'Earth',
      unitOxygenLevel: 123_123,
      unitHeatLevel: 456_456,
      unitPressureLevel: 789_789,
      unitPurificationLevel: 415_415,
      unitPlantsLevel: 101_101,
      unitInsectsLevel: 112_112,
      unitAnimalsLevel: 131_131
    };

    // Act
    const {terraformationIndex} = computeTerraformationSummary(level);

    // Assert
    expect(terraformationIndex).toBe(2_129_127);
  });
});
