import {describe, it, expect} from 'bun:test';
import {mergeSaveConfigurations} from './mergeSaveConfigurations';
import {createSaveConfiguration} from 'shared-save-processing/testing/createSaveRecords.js';

describe('Merge save configurations', () => {
  const saveDisplayName = 'SAVE_NAME';
  const baseSaveConfiguration = createSaveConfiguration();

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
      expect(result).toEqual({...saveConfigA, saveDisplayName: 'SAVE_NAME'});
    });
  });

  describe('When save A has no configuration', () => {
    it('should fall back to save B configuration', () => {
      // Arrange
      const saveConfigurationsA: never[] = [];
      const saveConfigurationsB = [saveConfigB];

      // Act
      const result = mergeSaveConfigurations(saveConfigurationsA, saveConfigurationsB, saveDisplayName);

      // Assert
      expect(result).toEqual({...saveConfigB, saveDisplayName: 'SAVE_NAME'});
    });
  });

  describe('When both saves have no configuration', () => {
    it('should report no configuration at all', () => {
      // Arrange
      const saveConfigurationsA: never[] = [];
      const saveConfigurationsB: never[] = [];

      // Act
      const result = mergeSaveConfigurations(saveConfigurationsA, saveConfigurationsB, saveDisplayName);

      // Assert
      expect(result).toBeUndefined();
    });
  });
});

