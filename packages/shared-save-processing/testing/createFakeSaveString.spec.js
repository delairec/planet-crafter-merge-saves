import {describe, it, expect} from 'bun:test';
import {createFakeSaveString, createLegacyFakeSaveString} from './createFakeSaveString.js';
import {createPlayer, createTerraformationLevel, createWorldEvent} from './createSaveRecords.js';
import {
  GLOBAL_METADATA_SECTION_INDEX,
  LEGACY_TERRAIN_LAYERS_SECTION_INDEX,
  LEGACY_WORLD_EVENTS_SECTION_INDEX,
  PLAYERS_SECTION_INDEX,
  SAVE_CONFIGURATION_SECTION_INDEX,
  STATISTICS_SECTION_INDEX,
  TERRAFORMATION_LEVELS_SECTION_INDEX
} from '../sectionIndexes.js';

describe('createFakeSaveString', () => {

  it('should split into 11 `@`-separated parts (10 sections + trailing reserved part)', () => {
    // Act
    const save = createFakeSaveString({});

    // Assert
    expect(save.split('@').length).toBe(11);
  });

  it('should serialize the default global metadata when none is provided', () => {
    // Act
    const save = createFakeSaveString({});

    // Assert
    const sections = save.split('\n@\n');
    expect(sections[GLOBAL_METADATA_SECTION_INDEX])
      .toBe('{"terraTokens":0,"allTimeTerraTokens":0,"unlockedGroups":"","openedInstanceSeed":0,"openedInstanceTimeLeft":0}');
  });

  it('should serialize the provided entries for a given section', () => {
    // Arrange
    const player = createPlayer({id: '1', name: 'Nikowa'});

    // Act
    const save = createFakeSaveString({players: [player]});

    // Assert
    const sections = save.split('\n@\n');
    expect(sections[PLAYERS_SECTION_INDEX]).toBe('{"id":1,"name":"Nikowa","inventoryId":44,"equipmentId":45,"playerPosition":"1751.865,472.58,-1106.104","playerRotation":"0,0.5740051,0,-0.8188518","playerGaugeOxygen":280.0,"playerGaugeThirst":96.3858642578125,"playerGaugeHealth":72.67363739013672,"playerGaugeToxic":0.0,"host":true,"planetId":"Toxicity","cameraView":0,"totalCraftedObjects":1820,"totalTerraTokenEarned":9000}');
  });

  it('should preserve decimal notation for known float fields', () => {
    // Act
    const save = createFakeSaveString({terraformationLevels: [createTerraformationLevel({unitOxygenLevel: 100})]});

    // Assert
    const sections = save.split('\n@\n');
    expect(sections[TERRAFORMATION_LEVELS_SECTION_INDEX]).toBe('{"planetId":"Toxicity","unitOxygenLevel":100.0,"unitHeatLevel":200.0,"unitPressureLevel":300.0,"unitPlantsLevel":400.0,"unitInsectsLevel":500.0,"unitAnimalsLevel":600.0,"unitPurificationLevel":700.0}');
  });

  describe('When statistics and saveConfiguration are not provided', () => {
    it('should serialize their sections as empty strings', () => {
      // Act
      const save = createFakeSaveString({});

      // Assert
      const sections = save.split('\n@\n');
      expect(sections[STATISTICS_SECTION_INDEX]).toBe('');
      expect(sections[SAVE_CONFIGURATION_SECTION_INDEX]).toBe('');
    });
  });
});

describe('createLegacyFakeSaveString', () => {

  it('should split into 12 `@`-separated parts (11 sections + trailing reserved part)', () => {
    // Act
    const save = createLegacyFakeSaveString({});

    // Assert
    expect(save.split('@').length).toBe(12);
  });

  it('should insert the Terrain Layers section right before World Events', () => {
    // Arrange
    const terrainLayer = {layerId: 'PC-Toxicity-Layer1', planet: 110910047, colorBase: '1-1-1-1'};

    // Act
    const save = createLegacyFakeSaveString({terrainLayers: [terrainLayer]});

    // Assert
    const sections = save.split('\n@\n');
    expect(sections[LEGACY_TERRAIN_LAYERS_SECTION_INDEX]).toBe('{"layerId":"PC-Toxicity-Layer1","planet":110910047,"colorBase":"1-1-1-1"}');
  });

  it('should keep World Events after the inserted Terrain Layers section', () => {
    // Arrange
    const worldEvent = createWorldEvent({planet: 110910045, seed: 1, pos: '0,0,0', owner: 0, index: 0});

    // Act
    const save = createLegacyFakeSaveString({worldEvents: [worldEvent]});

    // Assert
    const sections = save.replace(/\n@$/, '').split('\n@\n');
    expect(sections[LEGACY_WORLD_EVENTS_SECTION_INDEX]).toBe('{"planet":110910045,"seed":1,"pos":"0,0,0","owner":0,"index":0}');
  });
});
