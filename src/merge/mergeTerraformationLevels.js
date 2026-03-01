/** @import { TerraformationLevel } from '../types.js' */

import {stringifyEntry} from '../utils/stringifyEntry.js';

const PURIFICATION_SENTINEL = -1;

/**
 * @param {TerraformationLevel[]} terraformationLevelsA
 * @param {TerraformationLevel[]} terraformationLevelsB
 * @returns {string}
 * @see GR-TERRA-1, GR-TERRA-2, GR-TERRA-3 in docs/game-rules.md
 */
export function mergeTerraformationLevels(terraformationLevelsA, terraformationLevelsB) {
  const validatedLevelsA = terraformationLevelsA ?? [];
  const validatedLevelsB = terraformationLevelsB ?? [];

  const fullList = [...validatedLevelsA, ...validatedLevelsB];
  const deduplicatedPlanetIds = new Set(fullList.map(level => level.planetId));

  const mergedLevels = Array.from(deduplicatedPlanetIds).map(planetId => {
    const levelA = validatedLevelsA.find(level => level.planetId === planetId);
    const levelB = validatedLevelsB.find(level => level.planetId === planetId);

    if (levelA && levelB) {
      return stringifyEntry({
        planetId,
        unitOxygenLevel: Math.max(levelA.unitOxygenLevel, levelB.unitOxygenLevel),
        unitHeatLevel: Math.max(levelA.unitHeatLevel, levelB.unitHeatLevel),
        unitPressureLevel: Math.max(levelA.unitPressureLevel, levelB.unitPressureLevel),
        unitPlantsLevel: Math.max(levelA.unitPlantsLevel, levelB.unitPlantsLevel),
        unitInsectsLevel: Math.max(levelA.unitInsectsLevel, levelB.unitInsectsLevel),
        unitAnimalsLevel: Math.max(levelA.unitAnimalsLevel, levelB.unitAnimalsLevel),
        unitPurificationLevel: mergePurificationLevel(levelA.unitPurificationLevel, levelB.unitPurificationLevel),
      });
    }

    return stringifyEntry(/** @type {TerraformationLevel} */ (levelA || levelB));
  });

  return mergedLevels.join('|\n');
}

/**
 * @param {number} levelA
 * @param {number} levelB
 * @returns {number}
 */
function mergePurificationLevel(levelA, levelB) {
  if (levelA === PURIFICATION_SENTINEL && levelB === PURIFICATION_SENTINEL) return PURIFICATION_SENTINEL;
  if (levelA === PURIFICATION_SENTINEL) return levelB;
  if (levelB === PURIFICATION_SENTINEL) return levelA;
  return Math.max(levelA, levelB);
}

