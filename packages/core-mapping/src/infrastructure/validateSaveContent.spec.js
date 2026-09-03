import {describe, expect, it} from 'bun:test';
import {validateSaveContent} from './validateSaveContent.js';
import {VALIDATION_ISSUE_CODES} from '../application/ports/ValidationIssue.ts';
import {createFakeSaveString, createLegacyFakeSaveString} from 'shared-save-processing/testing/createFakeSaveString.js';
import {
  createEquipment,
  createFakeSaveContent,
  createGlobalMetadata,
  createInventory,
  createPlayer,
  createSaveConfiguration,
  createStatistics,
  createTerraformationLevel
} from 'shared-save-processing/testing/createFakeSaveContent.js';

describe('validateSaveContent', () => {

  describe('Return value shape', () => {
    it('should return a validation result with a validity flag and a list of errors', () => {
      // Arrange
      const save = createFakeSaveContent();

      // Act
      const result = validateSaveContent(save);

      // Assert
      expect('isValid' in result).toBeTruthy();
      expect('errors' in result).toBeTruthy();
    });

    it('should report a valid save as valid with no errors', () => {
      // Arrange
      const save = createFakeSaveContent();

      // Act
      const result = validateSaveContent(save);

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
      const result = validateSaveContent(invalidSave);

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
      const result = validateSaveContent(save);

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.errors.some(error => 'section' in error && 'entryIndex' in error)).toBeTruthy();
    });
  });

  describe('Section 0 — Global metadata schema', () => {
    it('should reject when terraTokens is not an integer', () => {
      // Arrange
      // @ts-expect-error intentionally invalid type to test validation
      const save = createFakeSaveString({globalMetadata: {...createGlobalMetadata(), terraTokens: 'abc'}});

      // Act
      const result = validateSaveContent(save);

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.section === 0)).toBeTruthy();
    });

    it('should reject when a required field is missing', () => {
      // Arrange
      const {openedInstanceTimeLeft: _, ...metadataWithoutTimeLeft} = createGlobalMetadata();
      // @ts-expect-error intentionally missing required field to test validation
      const save = createFakeSaveString({globalMetadata: metadataWithoutTimeLeft});

      // Act
      const result = validateSaveContent(save);

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.section === 0)).toBeTruthy();
    });
  });

  describe('Section 1 — Terraformation levels schema', () => {
    it('should reject when planetId is missing', () => {
      // Arrange
      const {planetId: _, ...levelWithoutPlanetId} = createTerraformationLevel();
      const save = createFakeSaveContent({terraformationLevels: [levelWithoutPlanetId]});

      // Act
      const result = validateSaveContent(save);

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.section === 1)).toBeTruthy();
    });

    it('should reject when a level field is negative', () => {
      // Arrange
      const save = createFakeSaveContent({
        terraformationLevels: [createTerraformationLevel({unitOxygenLevel: -1})]
      });

      // Act
      const result = validateSaveContent(save);

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.section === 1)).toBeTruthy();
    });
  });

  describe('Section 2 — Players schema', () => {
    it('should reject when a required player field is missing', () => {
      // Arrange
      const {host: _, ...playerWithoutHost} = createPlayer();
      const save = createFakeSaveContent({players: [playerWithoutHost]});

      // Act
      const result = validateSaveContent(save);

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.section === 2)).toBeTruthy();
    });

    it('should reject when playerPosition has an invalid format', () => {
      // Arrange
      const save = createFakeSaveContent({players: [createPlayer({playerPosition: 'bad-format'})]});

      // Act
      const result = validateSaveContent(save);

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.section === 2)).toBeTruthy();
    });

    it('should reject when playerGaugeOxygen is negative', () => {
      // Arrange
      const save = createFakeSaveContent({players: [createPlayer({playerGaugeOxygen: -1})]});

      // Act
      const result = validateSaveContent(save);

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.section === 2)).toBeTruthy();
    });

    it('should accept players without cameraView, totalCraftedObjects and totalTerraTokenEarned (backward compatibility)', () => {
      // Arrange
      const {cameraView: _cameraView, totalCraftedObjects: _totalCraftedObjects, totalTerraTokenEarned: _totalTerraTokenEarned, ...legacyPlayer} = createPlayer();
      const save = createFakeSaveContent({players: [legacyPlayer]});

      // Act
      const result = validateSaveContent(save);

      // Assert
      expect(result.isValid).toBe(true);
    });
  });

  describe('Section 4 — Inventories schema', () => {
    it('should reject when size is missing', () => {
      // Arrange
      const {size: _, ...inventoryWithoutSize} = createInventory();
      const save = createFakeSaveContent({inventories: [inventoryWithoutSize, createEquipment()]});

      // Act
      const result = validateSaveContent(save);

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.section === 4)).toBeTruthy();
    });

    it('should reject when size is negative', () => {
      // Arrange
      const save = createFakeSaveContent({inventories: [createInventory({size: -1}), createEquipment()]});

      // Act
      const result = validateSaveContent(save);

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.section === 4)).toBeTruthy();
    });
  });

  describe('Section 5 — Statistics schema', () => {
    it('should reject when craftedObjects is negative', () => {
      // Arrange
      const save = createFakeSaveContent({statistics: createStatistics({craftedObjects: -5})});

      // Act
      const result = validateSaveContent(save);

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.section === 5)).toBeTruthy();
    });
  });

  describe('Section 8 — Save configuration schema', () => {
    it('should reject when saveDisplayName is missing', () => {
      // Arrange
      const {saveDisplayName: _, ...configWithoutName} = createSaveConfiguration();
      const save = createFakeSaveContent({saveConfiguration: configWithoutName});

      // Act
      const result = validateSaveContent(save);

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.section === 8)).toBeTruthy();
    });

    it('should reject when modifierTerraformationPace is negative', () => {
      // Arrange
      const save = createFakeSaveContent({
        saveConfiguration: createSaveConfiguration({modifierTerraformationPace: -1})
      });

      // Act
      const result = validateSaveContent(save);

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.section === 8)).toBeTruthy();
    });
  });

  describe('Section 9 — World events schema', () => {
    it('should reject when pos has an invalid format', () => {
      // Arrange
      const save = createFakeSaveContent({worldEvents: [{planet: 110910045, seed: 42, pos: 'bad-pos'}]});

      // Act
      const result = validateSaveContent(save);

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.section === 9)).toBeTruthy();
    });
  });

  describe('Domain rules', () => {
    describe('Decimal notation for gauge and level values', () => {
      it('should reject a save where a gauge value is missing its decimal notation', () => {
        // Arrange
        const saveWithBadFloat = createFakeSaveContent().replace('"playerGaugeOxygen":280.0', '"playerGaugeOxygen":280');

        // Act
        const result = validateSaveContent(saveWithBadFloat);

        // Assert
        expect(result.isValid).toBe(false);
        expect(result.errors.some(e => e.code === VALIDATION_ISSUE_CODES.FLOAT_SERIALIZATION)).toBeTruthy();
      });

      it('should accept a save where gauge values have proper decimal notation', () => {
        // Arrange
        const save = createFakeSaveContent();

        // Act
        const result = validateSaveContent(save);

        // Assert
        expect(result.isValid).toBe(true);
        expect(!result.errors.some(e => e.code === VALIDATION_ISSUE_CODES.FLOAT_SERIALIZATION)).toBeTruthy();
      });

      it('should reject a save where all gauge values are missing their decimal notation', () => {
        // Arrange
        const playerWithAllIntegerGauges = createPlayer({
          playerGaugeOxygen: 280,
          playerGaugeThirst: 100,
          playerGaugeHealth: 72,
          playerGaugeToxic: 0
        });
        const saveWithBadFloats = createFakeSaveString({
          globalMetadata: createGlobalMetadata(),
          terraformationLevels: [createTerraformationLevel()],
          players: [playerWithAllIntegerGauges],
          inventories: [createInventory(), createEquipment()],
          statistics: createStatistics(),
          saveConfiguration: createSaveConfiguration()
        }).replace(/"playerGaugeOxygen":280\.0/g, '"playerGaugeOxygen":280')
          .replace(/"playerGaugeThirst":100\.0/g, '"playerGaugeThirst":100')
          .replace(/"playerGaugeHealth":72\.0/g, '"playerGaugeHealth":72')
          .replace(/"playerGaugeToxic":0\.0/g, '"playerGaugeToxic":0');

        // Act
        const result = validateSaveContent(saveWithBadFloats);

        // Assert
        expect(result.isValid).toBe(false);
        const floatErrors = result.errors.filter(e => e.code === VALIDATION_ISSUE_CODES.FLOAT_SERIALIZATION);
        expect(floatErrors.length >= 4).toBeTruthy();
      });
    });

    describe('Unique host rule', () => {
      it('should report an error when no player is host', () => {
        // Arrange
        const save = createFakeSaveContent({players: [createPlayer({host: false})]});

        // Act
        const result = validateSaveContent(save);

        // Assert
        expect(result.isValid).toBe(false);
        expect(result.errors.some(e => e.code === VALIDATION_ISSUE_CODES.UNIQUE_HOST)).toBeTruthy();
      });

      it('should report an error when more than one player is host', () => {
        // Arrange
        const firstPlayer = createPlayer();
        const secondPlayer = createPlayer({
          id: 76561198055446664,
          name: 'Chileny',
          inventoryId: 3,
          equipmentId: 4,
          host: true
        });
        const save = createFakeSaveContent({
          players: [firstPlayer, secondPlayer],
          inventories: [createInventory(), createEquipment(), {id: 3, woIds: '', size: 20}, {id: 4, woIds: '', size: 10}]
        });

        // Act
        const result = validateSaveContent(save);

        // Assert
        expect(result.isValid).toBe(false);
        expect(result.errors.some(e => e.code === VALIDATION_ISSUE_CODES.UNIQUE_HOST)).toBeTruthy();
      });

      it('should not report a host error for a valid save with one host', () => {
        // Arrange
        const save = createFakeSaveContent();

        // Act
        const result = validateSaveContent(save);

        // Assert
        expect(!result.errors.some(e => e.code === VALIDATION_ISSUE_CODES.UNIQUE_HOST)).toBeTruthy();
      });
    });

    describe('Consistent planetId rule', () => {
      it('should accept players with different planetId values', () => {
        // Arrange
        const firstPlayer = createPlayer();
        const playerOnOtherPlanet = createPlayer({
          id: 76561198055446664,
          name: 'Chileny',
          inventoryId: 3,
          equipmentId: 4,
          host: false,
          planetId: 'Prime'
        });
        const save = createFakeSaveContent({
          players: [firstPlayer, playerOnOtherPlanet],
          inventories: [createInventory(), createEquipment(), {id: 3, woIds: '', size: 20}, {id: 4, woIds: '', size: 10}]
        });

        // Act
        const result = validateSaveContent(save);

        // Assert
        expect(result.isValid).toBe(true);
      });
    });
  });

  describe('When the save uses the legacy format (still contains a Terrain Layers section removed by a game update)', () => {
    it('should accept the save as valid (backward compatibility)', () => {
      // Arrange
      const save = createLegacyFakeSaveString({
        globalMetadata: createGlobalMetadata(),
        terraformationLevels: [createTerraformationLevel()],
        players: [createPlayer()],
        inventories: [createInventory(), createEquipment()],
        statistics: createStatistics(),
        saveConfiguration: createSaveConfiguration(),
        terrainLayers: [{layerId: 'PC-Toxicity-Layer2', planet: 110910045, colorBase: '0.5-0.5-0.5-1'}]
      });

      // Act
      const result = validateSaveContent(save);

      // Assert
      expect(result.isValid).toBe(true);
    });

    it('should report a warning explaining the save was adapted', () => {
      // Arrange
      const save = createLegacyFakeSaveString({
        globalMetadata: createGlobalMetadata(),
        terraformationLevels: [createTerraformationLevel()],
        players: [createPlayer()],
        inventories: [createInventory(), createEquipment()],
        statistics: createStatistics(),
        saveConfiguration: createSaveConfiguration(),
        terrainLayers: [{layerId: 'PC-Toxicity-Layer2', planet: 110910045, colorBase: '0.5-0.5-0.5-1'}]
      });

      // Act
      const result = validateSaveContent(save);

      // Assert
      expect(result.warnings.length).toBe(1);
    });
  });

  describe('When the section count does not match any supported format', () => {
    it('should report an error', () => {
      // Arrange
      const save = 'This is not @ a valid save string';

      // Act
      const result = validateSaveContent(save);

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.errors).toEqual([
        {code: VALIDATION_ISSUE_CODES.INVALID_STRUCTURE, detail: `Expected 11 sections but found 2`}
      ]);
    });
  });
});
