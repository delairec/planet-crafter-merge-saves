import {describe, it, expect} from 'bun:test';
import {mergeStatistics} from './mergeStatistics';

describe('Merge statistics', () => {
  const statisticsFromSaveA = {craftedObjects: 3952, totalSaveFileLoad: 10, totalSaveFileTime: 500};
  const statisticsFromSaveB = {craftedObjects: 1000, totalSaveFileLoad: 20, totalSaveFileTime: 300};

  it('should merge statistics by summing values', () => {
    // Arrange
    const statisticsA = [statisticsFromSaveA];
    const statisticsB = [statisticsFromSaveB];

    // Act
    const result = mergeStatistics(statisticsA, statisticsB);

    // Assert
    expect(result).toBe('{"craftedObjects":4952,"totalSaveFileLoad":30,"totalSaveFileTime":800}');
  });
});

