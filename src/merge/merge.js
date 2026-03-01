/** @import { ParsedSave } from '../types.js' */

import {parseSaveSections} from '../utils/parseSaveSections.js';
import {mergeGlobalMetadata} from './mergeGlobalMetadata.js';
import {mergeTerraformationLevels} from './mergeTerraformationLevels.js';
import {mergePlayers} from './mergePlayers.js';
import {mergeWorldObjects} from './mergeWorldObjects.js';
import {mergeInventories} from './mergeInventories.js';
import {mergeStatistics} from './mergeStatistics.js';
import {mergeMailboxes} from './mergeMailboxes.js';
import {mergeStoryEvents} from './mergeStoryEvents.js';
import {mergeSaveConfigurations} from './mergeSaveConfigurations.js';
import {mergeTerrainLayers} from './mergeTerrainLayers.js';
import {mergeWorldEvents} from './mergeWorldEvents.js';
import {determineSaveOrder} from './determineSaveOrder.js';
import {collectEjectedPlayerInventoryIds} from './collectEjectedPlayerInventoryIds.js';

/** @returns {Generator<never>} */
function* EMPTY_GENERATOR() {
}

/**
 * Merges two Planet Crafter save strings section by section.
 * If one save has `planetId === 'Prime'` in its configuration, it is promoted to save A.
 * @param {string} saveA
 * @param {string} saveB
 * @param {string} saveDisplayName - Overrides `saveDisplayName` in the merged configuration.
 * @returns {{ mergeSaves: () => string, saveAWorldObjectIds: Set<number>, indexFileA: number, indexFileB: number }}
 */
export function merge(saveA, saveB, saveDisplayName) {
  const parsedSaveA = parseSaveSections(saveA);
  const parsedSaveB = parseSaveSections(saveB);

  const [mainSave, secondarySave] = determineSaveOrder(parsedSaveA, parsedSaveB);

  const [metadataA = [], terraformationLevelsA = [], playersA = [], worldObjectsGeneratorA = EMPTY_GENERATOR(), inventoriesA = [], statisticsA = [], mailboxA = [], storyEventsA = [], saveConfigurationsA = [], terrainLayersA = [], worldEventsA = []] = mainSave;
  const [metadataB = [], terraformationLevelsB = [], playersB = [], worldObjectsGeneratorB = EMPTY_GENERATOR(), inventoriesB = [], statisticsB = [], mailboxB = [], storyEventsB = [], saveConfigurationsB = [], terrainLayersB = [], worldEventsB = []] = secondarySave;

  const saveAWorldObjectIds = new Set();

  function mergeSaves() {
    const ejectedPlayerIds = collectEjectedPlayerInventoryIds(playersA, playersB, inventoriesB);

    const {serialized: serializedWorldObjects, saveAWorldObjectIds: collectedIds} = mergeWorldObjects(worldObjectsGeneratorA, worldObjectsGeneratorB, ejectedPlayerIds.orphanWorldObjectIds);
    for (const id of collectedIds) saveAWorldObjectIds.add(id);

    const sections = [
      mergeGlobalMetadata(metadataA, metadataB),
      mergeTerraformationLevels(terraformationLevelsA, terraformationLevelsB),
      mergePlayers(playersA, playersB),
      serializedWorldObjects,
      mergeInventories(inventoriesA, inventoriesB, ejectedPlayerIds.orphanInventoryIds),
      mergeStatistics(statisticsA, statisticsB),
      mergeMailboxes(mailboxA, mailboxB),
      mergeStoryEvents(storyEventsA, storyEventsB),
      mergeSaveConfigurations(saveConfigurationsA, saveConfigurationsB, saveDisplayName),
      mergeTerrainLayers(terrainLayersA, terrainLayersB),
      mergeWorldEvents(worldEventsA, worldEventsB)
    ];

    return sections.join('\n@\n') + '\n@';
  }

  return {
    mergeSaves,
    saveAWorldObjectIds,
    indexFileA: mainSave === parsedSaveA ? 0 : 1,
    indexFileB: secondarySave === parsedSaveB ? 1 : 0
  };
}


