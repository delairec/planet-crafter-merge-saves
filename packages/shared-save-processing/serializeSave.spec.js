/** @import { SerializeSaveParams } from './serializeSave.js' */

import {describe, it, expect} from 'bun:test';
import {serializeSave} from './serializeSave.js';
import {createPlayer, createSaveConfiguration, createStatistics, createTerraformationLevel} from './testing/createSaveRecords.js';

describe('serializeSave', () => {
  /** @type {SerializeSaveParams} */
  const emptyParams = {
    metadata: [], terraformationLevels: [], players: [], worldObjects: [], inventories: [],
    statistics: [], mailboxes: [], storyEvents: [], saveConfigurations: [], worldEvents: []
  };

  it('should join all sections with the section separator and terminate the save', () => {
    // Act
    const result = serializeSave(emptyParams);

    // Assert
    expect(result).toBe('\n@\n'.repeat(9) + '\n@');
  });

  it('should serialize world objects as entries separated by the entry separator', () => {
    // Arrange
    const params = {...emptyParams, worldObjects: [{id: 1, gId: 'Iron'}, {id: 2, gId: 'Cobalt'}]};

    // Act
    const sections = serializeSave(params).split('\n@\n');

    // Assert
    expect(sections[3]).toBe('{"id":1,"gId":"Iron"}|\n{"id":2,"gId":"Cobalt"}');
  });

  it('should preserve decimal notation for known float fields in world objects', () => {
    // Arrange
    const params = {...emptyParams, worldObjects: [{id: 1, gId: 'Tree', hunger: 50}]};

    // Act
    const sections = serializeSave(params).split('\n@\n');

    // Assert
    expect(sections[3]).toBe('{"id":1,"gId":"Tree","hunger":50.0}');
  });

  describe('When statistics is empty', () => {
    it('should serialize the statistics section as an empty string', () => {
      // Act
      const sections = serializeSave(emptyParams).split('\n@\n');

      // Assert
      expect(sections[5]).toBe('');
    });
  });

  describe('When statistics has an entry', () => {
    it('should serialize that single entry', () => {
      // Arrange
      const params = {...emptyParams, statistics: [createStatistics()]};

      // Act
      const sections = serializeSave(params).split('\n@\n');

      // Assert
      expect(sections[5]).toBe('{"craftedObjects":10,"totalSaveFileLoad":5,"totalSaveFileTime":3600}');
    });
  });

  describe('When saveConfigurations is empty', () => {
    it('should serialize the save configuration section as an empty string', () => {
      // Act
      const sections = serializeSave(emptyParams).split('\n@\n');

      // Assert
      expect(sections[8]).toBe('');
    });
  });

  describe('When saveConfigurations has an entry', () => {
    it('should serialize that single entry', () => {
      // Arrange
      const params = {...emptyParams, saveConfigurations: [createSaveConfiguration()]};

      // Act
      const sections = serializeSave(params).split('\n@\n');

      // Assert
      expect(sections[8]).toBe('{"saveDisplayName":"Merged Save","planetId":"Toxicity","unlockedSpaceTrading":false,"unlockedOreExtrators":false,"unlockedTeleporters":false,"unlockedDrones":false,"unlockedAutocrafter":false,"unlockedEverything":false,"freeCraft":false,"preInterplanetarySave":false,"randomizeMineables":false,"modifierTerraformationPace":0.1,"modifierPowerConsumption":0.2,"modifierGaugeDrain":0.3,"modifierMeteoOccurence":0.4,"modifierMultiplayerTerraformationFactor":0.5,"modded":false,"version":"1.0","mode":"Standard","dyingConsequencesLabel":"DropSomeItems","startLocationLabel":"Standard","worldSeed":42,"hasPlayedIntro":true,"gameStartLocation":"Standard"}');
    });
  });

  it('should preserve decimal notation for known float fields in terraformation levels and players', () => {
    // Arrange
    const params = {...emptyParams, terraformationLevels: [createTerraformationLevel()], players: [createPlayer()]};

    // Act
    const sections = serializeSave(params).split('\n@\n');

    // Assert
    expect(sections[1]).toBe('{"planetId":"Toxicity","unitOxygenLevel":100.0,"unitHeatLevel":200.0,"unitPressureLevel":300.0,"unitPlantsLevel":400.0,"unitInsectsLevel":500.0,"unitAnimalsLevel":600.0,"unitPurificationLevel":700.0}');
    expect(sections[2]).toBe('{"id":76561190000000000,"name":"Nikowa","inventoryId":44,"equipmentId":45,"playerPosition":"1751.865,472.58,-1106.104","playerRotation":"0,0.5740051,0,-0.8188518","playerGaugeOxygen":280.0,"playerGaugeThirst":96.3858642578125,"playerGaugeHealth":72.67363739013672,"playerGaugeToxic":0.0,"host":true,"planetId":"Toxicity","cameraView":0,"totalCraftedObjects":1820,"totalTerraTokenEarned":9000}');
  });
});
