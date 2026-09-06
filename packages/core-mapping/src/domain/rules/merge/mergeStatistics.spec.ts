import {describe, it, expect} from 'bun:test';
import {mergeStatistics} from './mergeStatistics';

describe('Merge statistics', () => {
  const statisticsFromSaveA = {craftedObjects: 3952, totalSaveFileLoad: 10, totalSaveFileTime: 500};
  const statisticsFromSaveB = {craftedObjects: 1000, totalSaveFileLoad: 20, totalSaveFileTime: 300};

  describe('When both saves have statistics', () => {
    it('should merge statistics by summing values', () => {
      // Act
      const result = mergeStatistics([statisticsFromSaveA], [statisticsFromSaveB]);

      // Assert
      expect(result).toEqual({craftedObjects: 4952, totalSaveFileLoad: 30, totalSaveFileTime: 800});
    });
  });

  describe('When neither save has statistics', () => {
    it('should report no statistics at all', () => {
      // Arrange
      const noStatisticsFromSaveA: never[] = [];
      const noStatisticsFromSaveB: never[] = [];

      // Act
      const result = mergeStatistics(noStatisticsFromSaveA, noStatisticsFromSaveB);

      // Assert
      expect(result).toBeUndefined();
    });
  });
});
