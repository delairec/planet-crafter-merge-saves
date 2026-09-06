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

  describe('When the save meets every rule', () => {
    it('should return a validation result with a validity flag and a list of errors', () => {
      // Arrange
      const save = createFakeSaveContent();

      // Act
      const result = validateSaveContent(save);

      // Assert
      expect('isValid' in result).toBeTruthy();
      expect('errors' in result).toBeTruthy();
    });

    it('should report the save as valid with no errors', () => {
      // Arrange
      const save = createFakeSaveContent();

      // Act
      const result = validateSaveContent(save);

      // Assert
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });
  });

  describe('When validating the overall save structure', () => {
    describe('When the save does not have the expected number of sections', () => {
      it('should reject the save', () => {
        // Arrange
        const invalidSave = 'not a valid save';

        // Act
        const result = validateSaveContent(invalidSave);

        // Assert
        expect(result.isValid).toBe(false);
        expect(result.errors.length > 0).toBeTruthy();
      });
    });

    describe('When an entry breaks a schema rule', () => {
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
  });

  describe('When validating the global metadata section', () => {
    describe('When terraTokens is not an integer', () => {
      it('should reject the save', () => {
        // Arrange
        // @ts-expect-error intentionally invalid type to test validation
        const save = createFakeSaveString({globalMetadata: {...createGlobalMetadata(), terraTokens: 'abc'}});

        // Act
        const result = validateSaveContent(save);

        // Assert
        expect(result.isValid).toBe(false);
        expect(result.errors.some(e => e.section === 0)).toBeTruthy();
      });
    });

    describe('When a required field is missing', () => {
      it('should reject the save', () => {
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
  });

  describe('When validating the terraformation levels section', () => {
    describe('When planetId is missing', () => {
      it('should reject the save', () => {
        // Arrange
        const {planetId: _, ...levelWithoutPlanetId} = createTerraformationLevel();
        const save = createFakeSaveContent({terraformationLevels: [levelWithoutPlanetId]});

        // Act
        const result = validateSaveContent(save);

        // Assert
        expect(result.isValid).toBe(false);
        expect(result.errors.some(e => e.section === 1)).toBeTruthy();
      });
    });

    describe('When a level field is negative', () => {
      it('should reject the save', () => {
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
  });

  describe('When validating the players section', () => {
    describe('When a required player field is missing', () => {
      it('should reject the save', () => {
        // Arrange
        const {host: _, ...playerWithoutHost} = createPlayer();
        const save = createFakeSaveContent({players: [playerWithoutHost]});

        // Act
        const result = validateSaveContent(save);

        // Assert
        expect(result.isValid).toBe(false);
        expect(result.errors.some(e => e.section === 2)).toBeTruthy();
      });
    });

    describe('When playerPosition has an invalid format', () => {
      it('should reject the save', () => {
        // Arrange
        const save = createFakeSaveContent({players: [createPlayer({playerPosition: 'bad-format'})]});

        // Act
        const result = validateSaveContent(save);

        // Assert
        expect(result.isValid).toBe(false);
        expect(result.errors.some(e => e.section === 2)).toBeTruthy();
      });
    });

    describe('When playerGaugeOxygen is negative', () => {
      it('should reject the save', () => {
        // Arrange
        const save = createFakeSaveContent({players: [createPlayer({playerGaugeOxygen: -1})]});

        // Act
        const result = validateSaveContent(save);

        // Assert
        expect(result.isValid).toBe(false);
        expect(result.errors.some(e => e.section === 2)).toBeTruthy();
      });
    });

    describe('When a player comes from an older save without cameraView, totalCraftedObjects and totalTerraTokenEarned', () => {
      it('should accept the save', () => {
        // Arrange
        const {cameraView: _cameraView, totalCraftedObjects: _totalCraftedObjects, totalTerraTokenEarned: _totalTerraTokenEarned, ...legacyPlayer} = createPlayer();
        const save = createFakeSaveContent({players: [legacyPlayer]});

        // Act
        const result = validateSaveContent(save);

        // Assert
        expect(result.isValid).toBe(true);
      });
    });
  });

  describe('When validating the inventories section', () => {
    describe('When size is missing', () => {
      it('should reject the save', () => {
        // Arrange
        const {size: _, ...inventoryWithoutSize} = createInventory();
        const save = createFakeSaveContent({inventories: [inventoryWithoutSize, createEquipment()]});

        // Act
        const result = validateSaveContent(save);

        // Assert
        expect(result.isValid).toBe(false);
        expect(result.errors.some(e => e.section === 4)).toBeTruthy();
      });
    });

    describe('When size is negative', () => {
      it('should reject the save', () => {
        // Arrange
        const save = createFakeSaveContent({inventories: [createInventory({size: -1}), createEquipment()]});

        // Act
        const result = validateSaveContent(save);

        // Assert
        expect(result.isValid).toBe(false);
        expect(result.errors.some(e => e.section === 4)).toBeTruthy();
      });
    });
  });

  describe('When validating the statistics section', () => {
    describe('When craftedObjects is negative', () => {
      it('should reject the save', () => {
        // Arrange
        const save = createFakeSaveContent({statistics: createStatistics({craftedObjects: -5})});

        // Act
        const result = validateSaveContent(save);

        // Assert
        expect(result.isValid).toBe(false);
        expect(result.errors.some(e => e.section === 5)).toBeTruthy();
      });
    });
  });

  describe('When validating the save configuration section', () => {
    describe('When saveDisplayName is missing', () => {
      it('should reject the save', () => {
        // Arrange
        const {saveDisplayName: _, ...configWithoutName} = createSaveConfiguration();
        const save = createFakeSaveContent({saveConfiguration: configWithoutName});

        // Act
        const result = validateSaveContent(save);

        // Assert
        expect(result.isValid).toBe(false);
        expect(result.errors.some(e => e.section === 8)).toBeTruthy();
      });
    });

    describe('When modifierTerraformationPace is negative', () => {
      it('should reject the save', () => {
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
  });

  describe('When validating the world events section', () => {
    describe('When pos has an invalid format', () => {
      it('should reject the save', () => {
        // Arrange
        const save = createFakeSaveContent({worldEvents: [{planet: 110910045, seed: 42, pos: 'bad-pos'}]});

        // Act
        const result = validateSaveContent(save);

        // Assert
        expect(result.isValid).toBe(false);
        expect(result.errors.some(e => e.section === 9)).toBeTruthy();
      });
    });
  });

  describe('When validating cross-section domain rules', () => {
    describe('When validating decimal notation for gauge and level values', () => {
      describe('When a gauge value is missing its decimal notation', () => {
        it('should reject the save', () => {
          // Arrange
          const saveWithBadFloat = createFakeSaveContent().replace('"playerGaugeOxygen":280.0', '"playerGaugeOxygen":280');

          // Act
          const result = validateSaveContent(saveWithBadFloat);

          // Assert
          expect(result.isValid).toBe(false);
          expect(result.errors.some(e => e.code === VALIDATION_ISSUE_CODES.FLOAT_SERIALIZATION)).toBeTruthy();
        });
      });

      describe('When every gauge value carries its decimal notation', () => {
        it('should accept the save', () => {
          // Arrange
          const save = createFakeSaveContent();

          // Act
          const result = validateSaveContent(save);

          // Assert
          expect(result.isValid).toBe(true);
          expect(!result.errors.some(e => e.code === VALIDATION_ISSUE_CODES.FLOAT_SERIALIZATION)).toBeTruthy();
        });
      });

      describe('When every gauge value is missing its decimal notation', () => {
        it('should reject the save reporting one error per gauge', () => {
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
    });

    describe('When validating the unique host rule', () => {
      describe('When no player is host', () => {
        it('should report an error', () => {
          // Arrange
          const save = createFakeSaveContent({players: [createPlayer({host: false})]});

          // Act
          const result = validateSaveContent(save);

          // Assert
          expect(result.isValid).toBe(false);
          expect(result.errors.some(e => e.code === VALIDATION_ISSUE_CODES.UNIQUE_HOST)).toBeTruthy();
        });
      });

      describe('When more than one player is host', () => {
        it('should report an error', () => {
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
      });

      describe('When exactly one player is host', () => {
        it('should not report a host error', () => {
          // Arrange
          const save = createFakeSaveContent();

          // Act
          const result = validateSaveContent(save);

          // Assert
          expect(!result.errors.some(e => e.code === VALIDATION_ISSUE_CODES.UNIQUE_HOST)).toBeTruthy();
        });
      });
    });

    describe('When validating the consistent planetId rule', () => {
      describe('When two players are on different planets', () => {
        it('should accept the save', () => {
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
