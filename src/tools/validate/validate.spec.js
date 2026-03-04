import {describe, expect, it} from 'bun:test';
import {validateMergedSave} from './validate.js';
import {createFakeSaveString} from '../../utils/testing/fixtures/createFakeSaveString.js';
import {
  createFakeSaveContent,
  equipment,
  inventory,
  metadata,
  player,
  saveConfiguration,
  statistics,
  terraformationLevel
} from '../../utils/testing/fixtures/createFakeSaveContent.js';

describe('validateMergedSave', () => {

  describe('Return value shape', () => {
    it('should return a validation result with a validity flag and a list of errors', () => {
      // Arrange
      const save = createFakeSaveContent();

      // Act
      const result = validateMergedSave(save);

      // Assert
      expect('isValid' in result).toBeTruthy();
      expect('errors' in result).toBeTruthy();
    });

    it('should report a valid save as valid with no errors', () => {
      // Arrange
      const save = createFakeSaveContent();

      // Act
      const result = validateMergedSave(save);

      // Assert
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });
  });

  describe('Structure validation', () => {
    it('should reject a save that does not have the expected number of sections', () => {
      // Arrange
      const invalidSave = 'not a valid save';

      // Act
      const result = validateMergedSave(invalidSave);

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.errors.length > 0).toBeTruthy();
    });

    it('should locate each error with its section and entry position', () => {
      // Arrange
      const save = createFakeSaveString({
        globalMetadata: {
          // @ts-expect-error intentionally invalid type to test validation
          terraTokens: 'not-a-number',
          allTimeTerraTokens: 200,
          unlockedGroups: 'BootsSpeed1',
          openedInstanceSeed: 0,
          openedInstanceTimeLeft: 0
        }
      });

      // Act
      const result = validateMergedSave(save);

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.errors.some(error => 'section' in error && 'entryIndex' in error)).toBeTruthy();
    });
  });

  describe('Section 0 — Global metadata schema', () => {
    it('should reject when terraTokens is not an integer', () => {
      // Arrange
      // @ts-expect-error intentionally invalid type to test validation
      const save = createFakeSaveString({globalMetadata: {...metadata, terraTokens: 'abc'}});

      // Act
      const result = validateMergedSave(save);

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.section === 0)).toBeTruthy();
    });

    it('should reject when a required field is missing', () => {
      // Arrange
      const {openedInstanceTimeLeft: _, ...metadataWithoutTimeLeft} = metadata;
      // @ts-expect-error intentionally missing required field to test validation
      const save = createFakeSaveString({globalMetadata: metadataWithoutTimeLeft});

      // Act
      const result = validateMergedSave(save);

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.section === 0)).toBeTruthy();
    });
  });

  describe('Section 1 — Terraformation levels schema', () => {
    it('should reject when planetId is missing', () => {
      // Arrange
      const {planetId: _, ...levelWithoutPlanetId} = terraformationLevel;
      const save = createFakeSaveContent({terraformationLevels: [levelWithoutPlanetId]});

      // Act
      const result = validateMergedSave(save);

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.section === 1)).toBeTruthy();
    });

    it('should reject when a level field is negative', () => {
      // Arrange
      const save = createFakeSaveContent({
        terraformationLevels: [{...terraformationLevel, unitOxygenLevel: -1}]
      });

      // Act
      const result = validateMergedSave(save);

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.section === 1)).toBeTruthy();
    });
  });

  describe('Section 2 — Players schema', () => {
    it('should reject when a required player field is missing', () => {
      // Arrange
      const {host: _, ...playerWithoutHost} = player;
      const save = createFakeSaveContent({players: [playerWithoutHost]});

      // Act
      const result = validateMergedSave(save);

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.section === 2)).toBeTruthy();
    });

    it('should reject when playerPosition has an invalid format', () => {
      // Arrange
      const save = createFakeSaveContent({players: [{...player, playerPosition: 'bad-format'}]});

      // Act
      const result = validateMergedSave(save);

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.section === 2)).toBeTruthy();
    });

    it('should reject when playerGaugeOxygen is negative', () => {
      // Arrange
      const save = createFakeSaveContent({players: [{...player, playerGaugeOxygen: -1}]});

      // Act
      const result = validateMergedSave(save);

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.section === 2)).toBeTruthy();
    });
  });

  describe('Section 4 — Inventories schema', () => {
    it('should reject when size is missing', () => {
      // Arrange
      const {size: _, ...inventoryWithoutSize} = inventory;
      const save = createFakeSaveContent({inventories: [inventoryWithoutSize, equipment]});

      // Act
      const result = validateMergedSave(save);

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.section === 4)).toBeTruthy();
    });

    it('should reject when size is negative', () => {
      // Arrange
      const save = createFakeSaveContent({inventories: [{...inventory, size: -1}, equipment]});

      // Act
      const result = validateMergedSave(save);

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.section === 4)).toBeTruthy();
    });
  });

  describe('Section 5 — Statistics schema', () => {
    it('should reject when craftedObjects is negative', () => {
      // Arrange
      const save = createFakeSaveContent({statistics: {...statistics, craftedObjects: -5}});

      // Act
      const result = validateMergedSave(save);

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.section === 5)).toBeTruthy();
    });
  });

  describe('Section 8 — Save configuration schema', () => {
    it('should reject when saveDisplayName is missing', () => {
      // Arrange
      const {saveDisplayName: _, ...configWithoutName} = saveConfiguration;
      const save = createFakeSaveContent({saveConfiguration: configWithoutName});

      // Act
      const result = validateMergedSave(save);

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.section === 8)).toBeTruthy();
    });

    it('should reject when modifierTerraformationPace is negative', () => {
      // Arrange
      const save = createFakeSaveContent({
        saveConfiguration: {...saveConfiguration, modifierTerraformationPace: -1}
      });

      // Act
      const result = validateMergedSave(save);

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.section === 8)).toBeTruthy();
    });
  });

  describe('Section 9 — Terrain layers schema', () => {
    it('should reject when colorBase has an invalid format', () => {
      // Arrange
      const save = createFakeSaveContent({
        terrainLayers: [{
          layerId: 'PC-Toxicity-Layer2',
          planet: 110910045,
          colorBase: 'bad',
          colorCustom: '0.5-0.5-0.5-1',
          colorBaseLerp: 50,
          colorCustomLerp: 50
        }]
      });

      // Act
      const result = validateMergedSave(save);

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.section === 9)).toBeTruthy();
    });

    it('should accept when colorBaseLerp exceeds 100 (valid game value)', () => {
      // Arrange
      const save = createFakeSaveContent({
        terrainLayers: [{
          layerId: 'PC-Toxicity-Layer2',
          planet: 110910045,
          colorBase: '0.5-0.5-0.5-1',
          colorCustom: '0.5-0.5-0.5-1',
          colorBaseLerp: 150,
          colorCustomLerp: 50
        }]
      });

      // Act
      const result = validateMergedSave(save);

      // Assert
      expect(result.isValid).toBe(true);
    });
  });

  describe('Section 10 — World events schema', () => {
    it('should reject when pos has an invalid format', () => {
      // Arrange
      const save = createFakeSaveContent({worldEvents: [{planet: 110910045, seed: 42, pos: 'bad-pos'}]});

      // Act
      const result = validateMergedSave(save);

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.section === 10)).toBeTruthy();
    });
  });

  describe('Domain rules', () => {
    describe('Decimal notation for gauge and level values', () => {
      it('should reject a save where a gauge value is missing its decimal notation', () => {
        // Arrange
        const saveWithBadFloat = createFakeSaveContent().replace('"playerGaugeOxygen":280.0', '"playerGaugeOxygen":280');

        // Act
        const result = validateMergedSave(saveWithBadFloat);

        // Assert
        expect(result.isValid).toBe(false);
        expect(result.errors.some(e => e.rule === 'float-serialization')).toBeTruthy();
      });

      it('should accept a save where gauge values have proper decimal notation', () => {
        // Arrange
        const save = createFakeSaveContent();

        // Act
        const result = validateMergedSave(save);

        // Assert
        expect(result.isValid).toBe(true);
        expect(!result.errors.some(e => e.rule === 'float-serialization')).toBeTruthy();
      });

      it('should reject a save where all gauge values are missing their decimal notation', () => {
        // Arrange
        const playerWithAllIntegerGauges = {
          ...player,
          playerGaugeOxygen: 280,
          playerGaugeThirst: 100,
          playerGaugeHealth: 72,
          playerGaugeToxic: 0
        };
        const saveWithBadFloats = createFakeSaveString({
          globalMetadata: metadata,
          terraformationLevels: [terraformationLevel],
          players: [playerWithAllIntegerGauges],
          inventories: [inventory, equipment],
          statistics: statistics,
          saveConfiguration: saveConfiguration
        }).replace(/"playerGaugeOxygen":280\.0/g, '"playerGaugeOxygen":280')
          .replace(/"playerGaugeThirst":100\.0/g, '"playerGaugeThirst":100')
          .replace(/"playerGaugeHealth":72\.0/g, '"playerGaugeHealth":72')
          .replace(/"playerGaugeToxic":0\.0/g, '"playerGaugeToxic":0');

        // Act
        const result = validateMergedSave(saveWithBadFloats);

        // Assert
        expect(result.isValid).toBe(false);
        const floatErrors = result.errors.filter(e => e.rule === 'float-serialization');
        expect(floatErrors.length >= 4).toBeTruthy();
      });
    });

    describe('Unique host rule', () => {
      it('should report an error when no player is host', () => {
        // Arrange
        const save = createFakeSaveContent({players: [{...player, host: false}]});

        // Act
        const result = validateMergedSave(save);

        // Assert
        expect(result.isValid).toBe(false);
        expect(result.errors.some(e => e.rule === 'unique-host')).toBeTruthy();
      });

      it('should report an error when more than one player is host', () => {
        // Arrange
        const secondPlayer = {
          ...player,
          id: 76561198055446664,
          name: 'Chileny',
          inventoryId: 3,
          equipmentId: 4,
          host: true
        };
        const save = createFakeSaveContent({
          players: [player, secondPlayer],
          inventories: [inventory, equipment, {id: 3, woIds: '', size: 20}, {id: 4, woIds: '', size: 10}]
        });

        // Act
        const result = validateMergedSave(save);

        // Assert
        expect(result.isValid).toBe(false);
        expect(result.errors.some(e => e.rule === 'unique-host')).toBeTruthy();
      });

      it('should not report a host error for a valid save with one host', () => {
        // Arrange
        const save = createFakeSaveContent();

        // Act
        const result = validateMergedSave(save);

        // Assert
        expect(!result.errors.some(e => e.rule === 'unique-host')).toBeTruthy();
      });
    });

    describe('Consistent planetId rule', () => {
      it('should accept players with different planetId values', () => {
        // Arrange
        const playerOnOtherPlanet = {
          ...player,
          id: 76561198055446664,
          name: 'Chileny',
          inventoryId: 3,
          equipmentId: 4,
          host: false,
          planetId: 'Prime'
        };
        const save = createFakeSaveContent({
          players: [player, playerOnOtherPlanet],
          inventories: [inventory, equipment, {id: 3, woIds: '', size: 20}, {id: 4, woIds: '', size: 10}]
        });

        // Act
        const result = validateMergedSave(save);

        // Assert
        expect(result.isValid).toBe(true);
      });
    });
  });
});

