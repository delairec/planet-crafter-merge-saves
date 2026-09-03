import {describe, it, expect} from 'bun:test';
import {mergeSaveConfigurations} from './mergeSaveConfigurations.js';

describe('Merge save configurations', () => {
  const saveDisplayName = 'SAVE_NAME';
  /** @type {import('util-types/gameDefinitions').SaveConfiguration} */
  const baseSaveConfiguration = {
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

  const saveConfigA = {
    ...baseSaveConfiguration,
    saveDisplayName: 'SAVE_A',
    planetId: 'Prime'
  };

  const saveConfigB = {
    ...baseSaveConfiguration,
    saveDisplayName: 'SAVE_B'
  };

  describe('When both saves have a configuration', () => {
    it('should use the saveDisplayName parameter and take save configuration from save A', () => {
      // Arrange
      const saveConfigurationsA = [saveConfigA];
      const saveConfigurationsB = [saveConfigB];

      // Act
      const result = mergeSaveConfigurations(saveConfigurationsA, saveConfigurationsB, saveDisplayName);

      // Assert
      expect(result).toBe(JSON.stringify({...saveConfigA, saveDisplayName}));
    });
  });

  describe('When save A has no configuration', () => {
    it('should fall back to save B configuration', () => {
      // Arrange
      const saveConfigurationsA = [];
      const saveConfigurationsB = [saveConfigB];

      // Act
      const result = mergeSaveConfigurations(saveConfigurationsA, saveConfigurationsB, saveDisplayName);

      // Assert
      expect(result).toBe(JSON.stringify({...saveConfigB, saveDisplayName}));
    });
  });

  describe('When both saves have no configuration', () => {
    it('should produce an empty configuration', () => {
      // Arrange
      const saveConfigurationsA = [];
      const saveConfigurationsB = [];

      // Act
      const result = mergeSaveConfigurations(saveConfigurationsA, saveConfigurationsB, saveDisplayName);

      // Assert
      expect(result).toBe('');
    });
  });
});

