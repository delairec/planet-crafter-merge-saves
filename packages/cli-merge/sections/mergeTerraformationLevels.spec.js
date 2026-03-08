import {describe, it, expect} from 'bun:test';
import {merge} from '../merge.js';
import {createFakeSaveString} from '../../util-testing/fixtures/createFakeSaveString.js';
import {terraformationLevel} from '../../util-testing/fixtures/createFakeSaveContent.js';
import {TERRAFORMATION_LEVELS_SECTION_INDEX} from '../../util-types/js/sectionIndexes.js';

describe('Merge saves — #2 Terraformation levels', () => {
  const SECTION_SEPARATOR = '@';
  const saveDisplayName = 'SAVE_NAME';

  const saveA_terraformationLevels = [{
    planetId: 'Toxicity',
    unitOxygenLevel: 100.0,
    unitHeatLevel: 200.0,
    unitPressureLevel: 300.0,
    unitPlantsLevel: 400.0,
    unitInsectsLevel: 500.0,
    unitAnimalsLevel: 600.0,
    unitPurificationLevel: 700.0
  }];

  const saveB_terraformationLevels = [
    {
      planetId: 'Prime',
      unitOxygenLevel: 10.0,
      unitHeatLevel: 20.0,
      unitPressureLevel: 30.0,
      unitPlantsLevel: 40.0,
      unitInsectsLevel: 50.0,
      unitAnimalsLevel: 60.0,
      unitPurificationLevel: -1.0
    },
    {
      planetId: 'Aqualis',
      unitOxygenLevel: 1.0,
      unitHeatLevel: 2.0,
      unitPressureLevel: 3.0,
      unitPlantsLevel: 4.0,
      unitInsectsLevel: 5.0,
      unitAnimalsLevel: 6.0,
      unitPurificationLevel: -1.0
    }
  ];

  describe('When terraformation levels are unique', () => {
    it('should simply concat terraformation levels', () => {
      // Arrange
      const fakeSaveA = createFakeSaveString({terraformationLevels: saveA_terraformationLevels});
      const fakeSaveB = createFakeSaveString({terraformationLevels: saveB_terraformationLevels});
      const {mergeSaves} = merge(fakeSaveA, fakeSaveB, saveDisplayName);

      // Act
      const result = mergeSaves();

      // Assert
      expect(result).toBe(createFakeSaveString({terraformationLevels: [...saveA_terraformationLevels, ...saveB_terraformationLevels]}));
    });
  });

  describe('When terraformation levels are duplicated', () => {
    it('should merge terraformation levels by taking max values', () => {
      // Arrange
      const fakeSaveA = createFakeSaveString({
        terraformationLevels: [
          ...saveA_terraformationLevels,
          {
            planetId: 'Prime',
            unitOxygenLevel: 101.0, unitHeatLevel: 201.0, unitPressureLevel: 301.0,
            unitPlantsLevel: 401.0, unitInsectsLevel: 501.0, unitAnimalsLevel: 601.0,
            unitPurificationLevel: -1.0
          }
        ]
      });
      const fakeSaveB = createFakeSaveString({terraformationLevels: saveB_terraformationLevels});
      const {mergeSaves} = merge(fakeSaveA, fakeSaveB, saveDisplayName);

      // Act
      const result = mergeSaves();

      // Assert
      expect(result).toBe(createFakeSaveString({
        terraformationLevels: [
          {...saveA_terraformationLevels[0]},
          {
            planetId: 'Prime',
            unitOxygenLevel: 101.0, unitHeatLevel: 201.0, unitPressureLevel: 301.0,
            unitPlantsLevel: 401.0, unitInsectsLevel: 501.0, unitAnimalsLevel: 601.0,
            unitPurificationLevel: -1.0
          },
          {...saveB_terraformationLevels[1]}
        ]
      }));
    });
  });

  describe('When unitPurificationLevel is -1 (sentinel for "not yet unlocked")', () => {
    it('should keep -1 when both saves have -1', () => {
      // Arrange
      const fakeSaveA = createFakeSaveString({
        terraformationLevels: [
          {
            ...terraformationLevel,
            planetId: 'Prime',
            unitPurificationLevel: -1.0
          }
        ]
      });
      const fakeSaveB = createFakeSaveString({
        terraformationLevels: [{
          ...terraformationLevel,
          planetId: 'Prime',
          unitPurificationLevel: -1.0
        }]
      });
      const {mergeSaves} = merge(fakeSaveA, fakeSaveB, saveDisplayName);

      // Act
      const result = mergeSaves();

      // Assert
      expect(result).toBe(createFakeSaveString({
        terraformationLevels: [{
          ...terraformationLevel,
          planetId: 'Prime',
          unitPurificationLevel: -1.0
        }]
      }));
    });

    it('should take the non-negative value when one save has -1 and the other has a real value', () => {
      // Arrange
      const fakeSaveA = createFakeSaveString({
        terraformationLevels: [{
          ...terraformationLevel,
          planetId: 'Toxicity',
          unitPurificationLevel: -1.0
        }]
      });
      const fakeSaveB = createFakeSaveString({
        terraformationLevels: [{
          ...terraformationLevel,
          planetId: 'Toxicity',
          unitPurificationLevel: 500.0
        }]
      });
      const {mergeSaves} = merge(fakeSaveA, fakeSaveB, saveDisplayName);

      // Act
      const result = mergeSaves();

      // Assert
      expect(result).toBe(createFakeSaveString({
        terraformationLevels: [{
          ...terraformationLevel,
          planetId: 'Toxicity',
          unitPurificationLevel: 500.0
        }]
      }));
    });
  });

  describe('When terraformation level values are integers', () => {
    it('should preserve decimal notation for whole number terraformation level values', () => {
      // Arrange
      const level = {
        planetId: 'Toxicity',
        unitOxygenLevel: 2477136019456.0, unitHeatLevel: 2219597103104.0, unitPressureLevel: 2262299836416.0,
        unitPlantsLevel: 918480420864.0, unitInsectsLevel: 372341538816.0, unitAnimalsLevel: 10118330580992.0,
        unitPurificationLevel: 2653680304128.0
      };
      const fakeSaveA = createFakeSaveString({terraformationLevels: [level]});
      const fakeSaveB = createFakeSaveString({});
      const {mergeSaves} = merge(fakeSaveA, fakeSaveB, saveDisplayName);

      // Act
      const result = mergeSaves();

      // Assert
      const terraSection = result.split(SECTION_SEPARATOR)[TERRAFORMATION_LEVELS_SECTION_INDEX];
      expect(terraSection).toInclude('"unitOxygenLevel":2477136019456.0');
      expect(result).toBe(createFakeSaveString({
        terraformationLevels: [{
          planetId: 'Toxicity',
          unitOxygenLevel: 2477136019456.0,
          unitHeatLevel: 2219597103104.0,
          unitPressureLevel: 2262299836416.0,
          unitPlantsLevel: 918480420864.0,
          unitInsectsLevel: 372341538816.0,
          unitAnimalsLevel: 10118330580992.0,
          unitPurificationLevel: 2653680304128.0
        }
        ]
      }));
    });
  });
});
