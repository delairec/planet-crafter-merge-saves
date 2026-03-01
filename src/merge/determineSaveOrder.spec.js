import {describe, it, expect} from 'bun:test';
import {merge} from './merge.js';
import {createFakeSaveString, FAKE_SAVE_CONFIGURATION} from '../utils/testing/fixtures/createFakeSaveString.js';

describe('Merge saves — #determineSaveOrder', () => {
  const saveDisplayName = 'SAVE_NAME';

  const primeConfig = {...FAKE_SAVE_CONFIGURATION, saveDisplayName: 'SavePrime', planetId: 'Prime'};
  const toxicityConfig = {...FAKE_SAVE_CONFIGURATION, saveDisplayName: 'SaveToxicity', planetId: 'Toxicity'};
  const aqualisConfig = {...FAKE_SAVE_CONFIGURATION, saveDisplayName: 'SaveAqualis', planetId: 'Aqualis'};

  describe('When one save has Prime as planetId and the other does not', () => {
    it('should return the Prime save as save A when it is passed second', () => {
      // Arrange
      const saveA = createFakeSaveString({saveConfiguration: toxicityConfig});
      const saveB = createFakeSaveString({saveConfiguration: primeConfig});
      const {mergeSaves} = merge(saveA, saveB, saveDisplayName);

      // Act
      const result = mergeSaves();

      // Assert
      expect(result).toBe(createFakeSaveString({saveConfiguration: {...primeConfig, saveDisplayName}}));
    });

    it('should keep the Prime save as save A when it is already passed first', () => {
      // Arrange
      const saveA = createFakeSaveString({saveConfiguration: primeConfig});
      const saveB = createFakeSaveString({saveConfiguration: toxicityConfig});
      const {mergeSaves} = merge(saveA, saveB, saveDisplayName);

      // Act
      const result = mergeSaves();

      // Assert
      expect(result).toBe(createFakeSaveString({saveConfiguration: {...primeConfig, saveDisplayName}}));
    });
  });

  describe('When neither save has Prime as planetId', () => {
    it('should return saves in the original order', () => {
      // Arrange
      const saveA = createFakeSaveString({saveConfiguration: toxicityConfig});
      const saveB = createFakeSaveString({saveConfiguration: aqualisConfig});
      const {mergeSaves} = merge(saveA, saveB, saveDisplayName);

      // Act
      const result = mergeSaves();

      // Assert
      expect(result).toBe(createFakeSaveString({saveConfiguration: {...toxicityConfig, saveDisplayName}}));
    });
  });

  describe('When both saves have Prime as planetId', () => {
    it('should return saves in the original order', () => {
      // Arrange
      const saveA = createFakeSaveString({saveConfiguration: /** @type {any} */ ({...primeConfig, worldSeed: 1})});
      const saveB = createFakeSaveString({saveConfiguration: /** @type {any} */ ({...primeConfig, worldSeed: 2})});
      const {mergeSaves} = merge(saveA, saveB, saveDisplayName);

      // Act
      const result = mergeSaves();

      // Assert
      expect(result).toBe(createFakeSaveString({saveConfiguration: /** @type {any} */ ({...primeConfig, worldSeed: 1, saveDisplayName})}));
    });
  });

  describe('When a save has no configuration', () => {
    it('should still promote the Prime save to save A', () => {
      // Arrange
      const saveA = createFakeSaveString({saveConfiguration: undefined});
      const saveB = createFakeSaveString({saveConfiguration: primeConfig});
      const {mergeSaves} = merge(saveA, saveB, saveDisplayName);

      // Act
      const result = mergeSaves();

      // Assert
      expect(result).toBe(createFakeSaveString({saveConfiguration: {...primeConfig, saveDisplayName}}));
    });
  });
});

