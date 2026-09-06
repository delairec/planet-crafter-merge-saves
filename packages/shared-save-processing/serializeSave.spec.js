/** @import { SerializeSaveParams } from './serializeSave.js' */

import {describe, it, expect} from 'bun:test';
import {serializeSave} from './serializeSave.js';

describe('serializeSave', () => {
  /** @type {SerializeSaveParams} */
  const emptyParams = {
    metadata: [],
    terraformationLevels: [],
    players: [],
    worldObjects: [],
    inventories: [],
    statistics: [],
    mailboxes: [],
    storyEvents: [],
    saveConfigurations: [],
    worldEvents: [],
  };

  const statistics = {craftedObjects: 10, totalSaveFileLoad: 5, totalSaveFileTime: 3600};

  const saveConfiguration = {
    saveDisplayName: 'Fake Save',
    planetId: 'Toxicity',
    version: '1.0',
    mode: 'Standard',
    worldSeed: 42,
    modded: false,
    modifierTerraformationPace: 1,
    modifierPowerConsumption: 1,
    modifierGaugeDrain: 1,
    modifierMeteoOccurence: 1,
    modifierMultiplayerTerraformationFactor: 1,
    unlockedSpaceTrading: false,
    unlockedOreExtrators: false,
    unlockedTeleporters: false,
    unlockedDrones: false,
    unlockedAutocrafter: false,
    unlockedEverything: false,
    freeCraft: false,
    preInterplanetarySave: false,
    randomizeMineables: false,
    dyingConsequencesLabel: 'DropSomeItems',
    startLocationLabel: 'Standard',
    hasPlayedIntro: true,
    gameStartLocation: 'Standard'
  };

  const terraformationLevel = {
    planetId: 'Toxicity',
    unitOxygenLevel: 100,
    unitHeatLevel: 200,
    unitPressureLevel: 300,
    unitPlantsLevel: 400,
    unitInsectsLevel: 500,
    unitAnimalsLevel: 600,
    unitPurificationLevel: 700
  };

  const player = {
    id: 1,
    name: 'Nikowa',
    inventoryId: 10,
    equipmentId: 11,
    playerPosition: '0,0,0',
    playerRotation: '0,0,0,0',
    playerGaugeOxygen: 280,
    playerGaugeThirst: 96,
    playerGaugeHealth: 72,
    playerGaugeToxic: 0,
    host: true,
    planetId: 'Toxicity',
    cameraView: 0,
    totalCraftedObjects: 0,
    totalTerraTokenEarned: 0
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
      const params = {...emptyParams, statistics: [statistics]};

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
      const params = {...emptyParams, saveConfigurations: [saveConfiguration]};

      // Act
      const sections = serializeSave(params).split('\n@\n');

      // Assert
      expect(sections[8]).toBe('{"saveDisplayName":"Fake Save","planetId":"Toxicity","version":"1.0","mode":"Standard","worldSeed":42,"modded":false,"modifierTerraformationPace":1,"modifierPowerConsumption":1,"modifierGaugeDrain":1,"modifierMeteoOccurence":1,"modifierMultiplayerTerraformationFactor":1,"unlockedSpaceTrading":false,"unlockedOreExtrators":false,"unlockedTeleporters":false,"unlockedDrones":false,"unlockedAutocrafter":false,"unlockedEverything":false,"freeCraft":false,"preInterplanetarySave":false,"randomizeMineables":false,"dyingConsequencesLabel":"DropSomeItems","startLocationLabel":"Standard","hasPlayedIntro":true,"gameStartLocation":"Standard"}');
    });
  });

  it('should preserve decimal notation for known float fields in terraformation levels and players', () => {
    // Arrange
    const params = {...emptyParams, terraformationLevels: [terraformationLevel], players: [player]};

    // Act
    const sections = serializeSave(params).split('\n@\n');

    // Assert
    expect(sections[1]).toBe('{"planetId":"Toxicity","unitOxygenLevel":100.0,"unitHeatLevel":200.0,"unitPressureLevel":300.0,"unitPlantsLevel":400.0,"unitInsectsLevel":500.0,"unitAnimalsLevel":600.0,"unitPurificationLevel":700.0}');
    expect(sections[2]).toBe('{"id":1,"name":"Nikowa","inventoryId":10,"equipmentId":11,"playerPosition":"0,0,0","playerRotation":"0,0,0,0","playerGaugeOxygen":280.0,"playerGaugeThirst":96.0,"playerGaugeHealth":72.0,"playerGaugeToxic":0.0,"host":true,"planetId":"Toxicity","cameraView":0,"totalCraftedObjects":0,"totalTerraTokenEarned":0}');
  });
});
