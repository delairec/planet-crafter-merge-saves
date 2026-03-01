import {describe, it, expect} from 'bun:test';
import {merge} from './merge.js';
import {createFakeSaveString} from '../utils/testing/fixtures/createFakeSaveString.js';
import {saveConfiguration} from '../utils/testing/fixtures/createFakeSaveContent.js';

describe('Merge saves — #8 Save configuration', () => {
  const saveDisplayName = 'SAVE_NAME';

  const saveConfigA = {
    ...saveConfiguration,
    saveDisplayName: 'SAVE_A',
    planetId: 'Prime'
  };

  const saveConfigB = {
    ...saveConfiguration,
    saveDisplayName: 'SAVE_B'
  };

  it('should use the saveDisplayName parameter and take save configuration from save A', () => {
    // Arrange
    const fakeSaveA = createFakeSaveString({saveConfiguration: saveConfigA});
    const fakeSaveB = createFakeSaveString({saveConfiguration: saveConfigB});
    const {mergeSaves} = merge(fakeSaveA, fakeSaveB, saveDisplayName);

    // Act
    const result = mergeSaves();

    // Assert
    expect(result).toBe(createFakeSaveString({saveConfiguration: {...saveConfigA, saveDisplayName}}));
  });

  it('should fall back to save B configuration if save A has none', () => {
    // Arrange
    const fakeSaveA = createFakeSaveString({saveConfiguration: undefined});
    const fakeSaveB = createFakeSaveString({saveConfiguration: saveConfigB});
    const {mergeSaves} = merge(fakeSaveA, fakeSaveB, saveDisplayName);

    // Act
    const result = mergeSaves();

    // Assert
    expect(result).toBe(createFakeSaveString({saveConfiguration: {...saveConfigB, saveDisplayName}}));
  });

  it('should produce an empty configuration if both saves have none', () => {
    // Arrange
    const fakeSaveA = createFakeSaveString({saveConfiguration: undefined});
    const fakeSaveB = createFakeSaveString({saveConfiguration: undefined});
    const {mergeSaves} = merge(fakeSaveA, fakeSaveB, saveDisplayName);

    // Act
    const result = mergeSaves();

    // Assert
    expect(result).toBe(createFakeSaveString({saveConfiguration: undefined}));
  });
});

