import {Statistics} from 'shared-save-processing/gameDefinitions';

const DEFAULT_STATISTICS: Statistics = {craftedObjects: 0, totalSaveFileLoad: 0, totalSaveFileTime: 0};

/**
 * @see GR-STAT-1 in docs/game-rules.md
 */
export function mergeStatistics([statisticsA]: Statistics[], [statisticsB]: Statistics[]): Statistics | undefined {
  if (!statisticsA && !statisticsB) {
    return undefined;
  }

  const validatedStatisticsA = statisticsA ?? DEFAULT_STATISTICS;
  const validatedStatisticsB = statisticsB ?? DEFAULT_STATISTICS;

  return {
    craftedObjects: validatedStatisticsA.craftedObjects + validatedStatisticsB.craftedObjects,
    totalSaveFileLoad: validatedStatisticsA.totalSaveFileLoad + validatedStatisticsB.totalSaveFileLoad,
    totalSaveFileTime: validatedStatisticsA.totalSaveFileTime + validatedStatisticsB.totalSaveFileTime,
  };
}
