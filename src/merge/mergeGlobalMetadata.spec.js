import {describe, it, expect} from 'bun:test';
import {merge} from './merge.js';
import {createFakeSaveString} from '../utils/testing/fixtures/createFakeSaveString.js';

describe('Merge saves — #1 Global metadata', () => {
  const saveDisplayName = 'SAVE_NAME';

  const saveA_metadata = {
    terraTokens: 122279,
    allTimeTerraTokens: 222154,
    unlockedGroups: 'MultiToolMineSpeed1,BootsSpeed1,BootsSpeed2,SofaColored',
    openedInstanceSeed: 0,
    openedInstanceTimeLeft: 2
  };

  const saveB_metadata = {
    terraTokens: 10928,
    allTimeTerraTokens: 11456,
    unlockedGroups: 'MultiToolMineSpeed1,BootsSpeed1,BedDoubleColored',
    openedInstanceSeed: 1,
    openedInstanceTimeLeft: 0
  };

  const mergedSave_metadata = {
    terraTokens: 133207,
    allTimeTerraTokens: 233610,
    unlockedGroups: 'MultiToolMineSpeed1,BootsSpeed1,BootsSpeed2,SofaColored,BedDoubleColored',
    openedInstanceSeed: 1,
    openedInstanceTimeLeft: 2
  };

  it('should merge metadata', () => {
    // Arrange
    const fakeSaveA = createFakeSaveString({globalMetadata: saveA_metadata});
    const fakeSaveB = createFakeSaveString({globalMetadata: saveB_metadata});
    const {mergeSaves} = merge(fakeSaveA, fakeSaveB, saveDisplayName);

    // Act
    const result = mergeSaves();

    // Assert
    expect(result).toBe(createFakeSaveString({globalMetadata: mergedSave_metadata}));
  });
});

