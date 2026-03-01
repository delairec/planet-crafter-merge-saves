import {describe, it, expect} from 'bun:test';
import {merge} from './merge.js';
import {createFakeSaveString} from '../utils/testing/fixtures/createFakeSaveString.js';

describe('Merge saves — #5 Statistics', () => {
  const saveDisplayName = 'SAVE_NAME';

  it('should merge statistics by summing values', () => {
    // Arrange
    const fakeSaveA = createFakeSaveString({statistics: {craftedObjects: 3952, totalSaveFileLoad: 10, totalSaveFileTime: 500}});
    const fakeSaveB = createFakeSaveString({statistics: {craftedObjects: 1000, totalSaveFileLoad: 20, totalSaveFileTime: 300}});
    const {mergeSaves} = merge(fakeSaveA, fakeSaveB, saveDisplayName);

    // Act
    const result = mergeSaves();

    // Assert
    expect(result).toBe(createFakeSaveString({statistics: {craftedObjects: 4952, totalSaveFileLoad: 30, totalSaveFileTime: 800}}));
  });
});

