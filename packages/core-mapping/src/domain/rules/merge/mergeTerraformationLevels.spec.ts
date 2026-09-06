import {describe, expect, it} from 'bun:test';
import {mergeTerraformationLevels} from './mergeTerraformationLevels';

describe('Merge terraformation levels', () => {
  const baseTerraformationLevel = {
    planetId: 'Toxicity',
    unitOxygenLevel: 100.0,
    unitHeatLevel: 200.0,
    unitPressureLevel: 300.0,
    unitPlantsLevel: 400.0,
    unitInsectsLevel: 500.0,
    unitAnimalsLevel: 600.0,
    unitPurificationLevel: 700.0
  };

  const toxicityLevelFromSaveA = {...baseTerraformationLevel};

  const primeLevelFromSaveB = {
    planetId: 'Prime',
    unitOxygenLevel: 10.0,
    unitHeatLevel: 20.0,
    unitPressureLevel: 30.0,
    unitPlantsLevel: 40.0,
    unitInsectsLevel: 50.0,
    unitAnimalsLevel: 60.0,
    unitPurificationLevel: -1.0
  };

  const aqualisLevelFromSaveB = {
    planetId: 'Aqualis',
    unitOxygenLevel: 1.0,
    unitHeatLevel: 2.0,
    unitPressureLevel: 3.0,
    unitPlantsLevel: 4.0,
    unitInsectsLevel: 5.0,
    unitAnimalsLevel: 6.0,
    unitPurificationLevel: -1.0
  };

  describe('When terraformation levels are unique', () => {
    it('should simply concat terraformation levels', () => {
      // Act
      const result = mergeTerraformationLevels([toxicityLevelFromSaveA], [primeLevelFromSaveB, aqualisLevelFromSaveB]);

      // Assert
      expect(result).toEqual([toxicityLevelFromSaveA, primeLevelFromSaveB, aqualisLevelFromSaveB]);
    });
  });

  describe('When terraformation levels are duplicated', () => {
    it('should merge terraformation levels by taking max values', () => {
      // Arrange
      const primeLevelFromSaveA = {
        planetId: 'Prime',
        unitOxygenLevel: 101.0, unitHeatLevel: 201.0, unitPressureLevel: 301.0,
        unitPlantsLevel: 401.0, unitInsectsLevel: 501.0, unitAnimalsLevel: 601.0,
        unitPurificationLevel: -1.0
      };

      // Act
      const result = mergeTerraformationLevels([toxicityLevelFromSaveA, primeLevelFromSaveA], [primeLevelFromSaveB, aqualisLevelFromSaveB]);

      // Assert
      expect(result).toEqual([
        toxicityLevelFromSaveA,
        {
          planetId: 'Prime',
          unitOxygenLevel: 101.0, unitHeatLevel: 201.0, unitPressureLevel: 301.0,
          unitPlantsLevel: 401.0, unitInsectsLevel: 501.0, unitAnimalsLevel: 601.0,
          unitPurificationLevel: -1.0
        },
        aqualisLevelFromSaveB
      ]);
    });
  });

  describe('When both saves have unitPurificationLevel at -1 (sentinel for "not yet unlocked")', () => {
    it('should keep -1', () => {
      // Arrange
      const levelsFromSaveA = [{...baseTerraformationLevel, planetId: 'Prime', unitPurificationLevel: -1.0}];
      const levelsFromSaveB = [{...baseTerraformationLevel, planetId: 'Prime', unitPurificationLevel: -1.0}];

      // Act
      const result = mergeTerraformationLevels(levelsFromSaveA, levelsFromSaveB);

      // Assert
      expect(result).toEqual([{...baseTerraformationLevel, planetId: 'Prime', unitPurificationLevel: -1.0}]);
    });
  });

  describe('When only one save has unitPurificationLevel at -1', () => {
    it('should take the non-negative value of the other save', () => {
      // Arrange
      const levelsFromSaveA = [{...baseTerraformationLevel, unitPurificationLevel: -1.0}];
      const levelsFromSaveB = [{...baseTerraformationLevel, unitPurificationLevel: 500.0}];

      // Act
      const result = mergeTerraformationLevels(levelsFromSaveA, levelsFromSaveB);

      // Assert
      expect(result).toEqual([{...baseTerraformationLevel, unitPurificationLevel: 500.0}]);
    });
  });
});
