/** @import { Statistics } from '../../../types/js/types.js' */

const DEFAULT_STATISTICS = {craftedObjects: 0, totalSaveFileLoad: 0, totalSaveFileTime: 0};

/**
 * @param {Statistics[]} statisticsA
 * @param {Statistics[]} statisticsB
 * @returns {string}
 * @see GR-STAT-1 in docs/business-rules.md
 */
export function mergeStatistics([statisticsA], [statisticsB]) {
  if (!statisticsA && !statisticsB) return '';

  const validatedStatisticsA = statisticsA ?? DEFAULT_STATISTICS;
  const validatedStatisticsB = statisticsB ?? DEFAULT_STATISTICS;

  return `{"craftedObjects":${validatedStatisticsA.craftedObjects + validatedStatisticsB.craftedObjects},"totalSaveFileLoad":${validatedStatisticsA.totalSaveFileLoad + validatedStatisticsB.totalSaveFileLoad},"totalSaveFileTime":${validatedStatisticsA.totalSaveFileTime + validatedStatisticsB.totalSaveFileTime}}`;
}

