import {describe, it} from 'node:test';
import {equal, deepEqual, ok} from 'node:assert/strict';
import {validateMergedSave} from './validate.js';
import {createFakeSaveString} from './testing/createFakeSaveString.js';

const validPlayer = {
  id: 76561198155441595,
  name: 'Rrose',
  inventoryId: 44,
  equipmentId: 45,
  playerPosition: '1751.865,472.58,-1106.104',
  playerRotation: '0,0.5740051,0,-0.8188518',
  playerGaugeOxygen: 280.0,
  playerGaugeThirst: 96.3858642578125,
  playerGaugeHealth: 72.67363739013672,
  playerGaugeToxic: 0.0,
  host: true,
  planetId: 'Toxicity'
};

const validInventory = {id: 44, woIds: '', size: 20};
const validEquipment = {id: 45, woIds: '', size: 10};

const validSaveConfiguration = {
  saveDisplayName: 'Merged Save',
  planetId: 'Toxicity',
  unlockedSpaceTrading: false,
  unlockedOreExtrators: false,
  unlockedTeleporters: false,
  unlockedDrones: false,
  unlockedAutocrafter: false,
  unlockedEverything: false,
  freeCraft: false,
  preInterplanetarySave: false,
  randomizeMineables: false,
  modifierTerraformationPace: 1.0,
  modifierPowerConsumption: 1.0,
  modifierGaugeDrain: 1.0,
  modifierMeteoOccurence: 1.0,
  modifierMultiplayerTerraformationFactor: 1.0,
  modded: false,
  version: '1.0',
  mode: 'Standard',
  dyingConsequencesLabel: 'DropSomeItems',
  startLocationLabel: 'Standard',
  worldSeed: 42,
  hasPlayedIntro: true,
  gameStartLocation: 'Standard'
};

const validMetadata = {
  terraTokens: 100,
  allTimeTerraTokens: 200,
  unlockedGroups: 'BootsSpeed1',
  openedInstanceSeed: 0,
  openedInstanceTimeLeft: 0
};

const validTerraformationLevel = {
  planetId: 'Toxicity',
  unitOxygenLevel: 100.0,
  unitHeatLevel: 200.0,
  unitPressureLevel: 300.0,
  unitPlantsLevel: 400.0,
  unitInsectsLevel: 500.0,
  unitAnimalsLevel: 600.0,
  unitPurificationLevel: 700.0
};

const validStatistics = {
  craftedObjects: 10,
  totalSaveFileLoad: 5,
  totalSaveFileTime: 3600
};

function buildValidSave(overrides = {}) {
  return createFakeSaveString({
    globalMetadata: validMetadata,
    terraformationLevels: [validTerraformationLevel],
    players: [validPlayer],
    inventories: [validInventory, validEquipment],
    statistics: validStatistics,
    saveConfiguration: validSaveConfiguration,
    ...overrides
  });
}

describe('validateMergedSave', () => {

  describe('Return value shape', () => {
    it('should return an object with isValid and errors properties', () => {
      const result = validateMergedSave(buildValidSave());
      ok('isValid' in result);
      ok('errors' in result);
    });

    it('should return isValid: true and an empty errors array for a valid save', () => {
      const result = validateMergedSave(buildValidSave());
      equal(result.isValid, true);
      deepEqual(result.errors, []);
    });
  });

  describe('Structure validation', () => {
    it('should return isValid: false when the save string is not split into 12 sections', () => {
      const result = validateMergedSave('not a valid save');
      equal(result.isValid, false);
      ok(result.errors.length > 0);
    });

    it('should include a section and entry index in each error', () => {
      // A save with an invalid section 0 entry (missing required fields)
      const save = createFakeSaveString({
        globalMetadata: {
          terraTokens: 'not-a-number',
          allTimeTerraTokens: 200,
          unlockedGroups: 'BootsSpeed1',
          openedInstanceSeed: 0,
          openedInstanceTimeLeft: 0
        }
      });
      const result = validateMergedSave(save);
      equal(result.isValid, false);
      ok(result.errors.some(error => 'section' in error && 'entryIndex' in error));
    });
  });

  describe('Section 0 — Global metadata schema', () => {
    it('should reject when terraTokens is not an integer', () => {
      const result = validateMergedSave(createFakeSaveString({
        globalMetadata: {...validMetadata, terraTokens: 'abc'}
      }));
      equal(result.isValid, false);
      ok(result.errors.some(e => e.section === 0));
    });

    it('should reject when a required field is missing', () => {
      const {openedInstanceTimeLeft: _, ...metadataWithoutTimeLeft} = validMetadata;
      const result = validateMergedSave(createFakeSaveString({
        globalMetadata: metadataWithoutTimeLeft
      }));
      equal(result.isValid, false);
      ok(result.errors.some(e => e.section === 0));
    });
  });

  describe('Section 1 — Terraformation levels schema', () => {
    it('should reject when planetId is missing', () => {
      const {planetId: _, ...levelWithoutPlanetId} = validTerraformationLevel;
      const result = validateMergedSave(buildValidSave({
        terraformationLevels: [levelWithoutPlanetId]
      }));
      equal(result.isValid, false);
      ok(result.errors.some(e => e.section === 1));
    });

    it('should reject when a level field is negative', () => {
      const result = validateMergedSave(buildValidSave({
        terraformationLevels: [{...validTerraformationLevel, unitOxygenLevel: -1}]
      }));
      equal(result.isValid, false);
      ok(result.errors.some(e => e.section === 1));
    });
  });

  describe('Section 2 — Players schema', () => {
    it('should reject when a required player field is missing', () => {
      const {host: _, ...playerWithoutHost} = validPlayer;
      const result = validateMergedSave(buildValidSave({players: [playerWithoutHost]}));
      equal(result.isValid, false);
      ok(result.errors.some(e => e.section === 2));
    });

    it('should reject when playerPosition has an invalid format', () => {
      const result = validateMergedSave(buildValidSave({
        players: [{...validPlayer, playerPosition: 'bad-format'}]
      }));
      equal(result.isValid, false);
      ok(result.errors.some(e => e.section === 2));
    });

    it('should reject when playerGaugeOxygen is negative', () => {
      const result = validateMergedSave(buildValidSave({
        players: [{...validPlayer, playerGaugeOxygen: -1}]
      }));
      equal(result.isValid, false);
      ok(result.errors.some(e => e.section === 2));
    });
  });

  describe('Section 4 — Inventories schema', () => {
    it('should reject when size is missing', () => {
      const {size: _, ...inventoryWithoutSize} = validInventory;
      const result = validateMergedSave(buildValidSave({
        inventories: [inventoryWithoutSize, validEquipment]
      }));
      equal(result.isValid, false);
      ok(result.errors.some(e => e.section === 4));
    });

    it('should reject when size is negative', () => {
      const result = validateMergedSave(buildValidSave({
        inventories: [{...validInventory, size: -1}, validEquipment]
      }));
      equal(result.isValid, false);
      ok(result.errors.some(e => e.section === 4));
    });
  });

  describe('Section 5 — Statistics schema', () => {
    it('should reject when craftedObjects is negative', () => {
      const result = validateMergedSave(buildValidSave({
        statistics: {...validStatistics, craftedObjects: -5}
      }));
      equal(result.isValid, false);
      ok(result.errors.some(e => e.section === 5));
    });
  });

  describe('Section 8 — Save configuration schema', () => {
    it('should reject when saveDisplayName is missing', () => {
      const {saveDisplayName: _, ...configWithoutName} = validSaveConfiguration;
      const result = validateMergedSave(buildValidSave({
        saveConfiguration: configWithoutName
      }));
      equal(result.isValid, false);
      ok(result.errors.some(e => e.section === 8));
    });

    it('should reject when modifierTerraformationPace is negative', () => {
      const result = validateMergedSave(buildValidSave({
        saveConfiguration: {...validSaveConfiguration, modifierTerraformationPace: -1}
      }));
      equal(result.isValid, false);
      ok(result.errors.some(e => e.section === 8));
    });
  });

  describe('Section 9 — Terrain layers schema', () => {
    it('should reject when colorBase has an invalid format', () => {
      const result = validateMergedSave(buildValidSave({
        terrainLayers: [{layerId: 'PC-Toxicity-Layer2', planet: 110910045, colorBase: 'bad', colorCustom: '0.5-0.5-0.5-1', colorBaseLerp: 50, colorCustomLerp: 50}]
      }));
      equal(result.isValid, false);
      ok(result.errors.some(e => e.section === 9));
    });

    it('should accept when colorBaseLerp exceeds 100 (valid game value)', () => {
      const result = validateMergedSave(buildValidSave({
        terrainLayers: [{layerId: 'PC-Toxicity-Layer2', planet: 110910045, colorBase: '0.5-0.5-0.5-1', colorCustom: '0.5-0.5-0.5-1', colorBaseLerp: 150, colorCustomLerp: 50}]
      }));
      equal(result.isValid, true);
    });
  });

  describe('Section 10 — World events schema', () => {
    it('should reject when pos has an invalid format', () => {
      const result = validateMergedSave(buildValidSave({
        worldEvents: [{planet: 110910045, seed: 42, pos: 'bad-pos'}]
      }));
      equal(result.isValid, false);
      ok(result.errors.some(e => e.section === 10));
    });
  });

  describe('Domain rules', () => {
    describe('Float serialization (.0 suffix)', () => {
      it('should report an error when a float field is serialized without .0 suffix for integer values', () => {
        // Manually build a save where playerGaugeOxygen=280 is serialized as 280 (no .0)
        const saveWithBadFloat = buildValidSave().replace('"playerGaugeOxygen":280.0', '"playerGaugeOxygen":280');
        const result = validateMergedSave(saveWithBadFloat);
        equal(result.isValid, false);
        ok(result.errors.some(e => e.rule === 'float-serialization'));
      });

      it('should not report a float error when the value already has decimals', () => {
        // playerGaugeThirst: 96.3858642578125 — already has decimals, no .0 needed
        const result = validateMergedSave(buildValidSave());
        equal(result.isValid, true);
        ok(!result.errors.some(e => e.rule === 'float-serialization'));
      });

      it('should report float errors for all FLOAT_FIELDS when serialized without .0', () => {
        const playerWithAllIntegerGauges = {
          ...validPlayer,
          playerGaugeOxygen: 280,
          playerGaugeThirst: 100,
          playerGaugeHealth: 72,
          playerGaugeToxic: 0
        };
        const saveWithBadFloats = createFakeSaveString({
          globalMetadata: validMetadata,
          terraformationLevels: [validTerraformationLevel],
          players: [playerWithAllIntegerGauges],
          inventories: [validInventory, validEquipment],
          statistics: validStatistics,
          saveConfiguration: validSaveConfiguration
        }).replace(/"playerGaugeOxygen":280\.0/g, '"playerGaugeOxygen":280')
          .replace(/"playerGaugeThirst":100\.0/g, '"playerGaugeThirst":100')
          .replace(/"playerGaugeHealth":72\.0/g, '"playerGaugeHealth":72')
          .replace(/"playerGaugeToxic":0\.0/g, '"playerGaugeToxic":0');

        const result = validateMergedSave(saveWithBadFloats);
        equal(result.isValid, false);
        const floatErrors = result.errors.filter(e => e.rule === 'float-serialization');
        ok(floatErrors.length >= 4);
      });
    });

    describe('Unique host rule', () => {
      it('should report an error when no player is host', () => {
        const result = validateMergedSave(buildValidSave({
          players: [{...validPlayer, host: false}]
        }));
        equal(result.isValid, false);
        ok(result.errors.some(e => e.rule === 'unique-host'));
      });

      it('should report an error when more than one player is host', () => {
        const secondPlayer = {
          ...validPlayer,
          id: 76561198055446664,
          name: 'Chillie',
          inventoryId: 3,
          equipmentId: 4,
          host: true
        };
        const result = validateMergedSave(buildValidSave({
          players: [validPlayer, secondPlayer],
          inventories: [validInventory, validEquipment, {id: 3, woIds: '', size: 20}, {id: 4, woIds: '', size: 10}]
        }));
        equal(result.isValid, false);
        ok(result.errors.some(e => e.rule === 'unique-host'));
      });

      it('should not report a host error for a valid save with one host', () => {
        const result = validateMergedSave(buildValidSave());
        ok(!result.errors.some(e => e.rule === 'unique-host'));
      });
    });

    describe('Consistent planetId rule', () => {
      it('should accept players with different planetId values', () => {
        const playerOnOtherPlanet = {
          ...validPlayer,
          id: 76561198055446664,
          name: 'Chillie',
          inventoryId: 3,
          equipmentId: 4,
          host: false,
          planetId: 'Prime'
        };
        const result = validateMergedSave(buildValidSave({
          players: [validPlayer, playerOnOtherPlanet],
          inventories: [validInventory, validEquipment, {id: 3, woIds: '', size: 20}, {id: 4, woIds: '', size: 10}]
        }));
        equal(result.isValid, true);
      });
    });
  });
});

