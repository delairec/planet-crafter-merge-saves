/** @import { ParsedSave } from '../util-types/js/types.js' */

import {parseSaveSections} from '../util-parsing/parseSaveSections.js';
import {mergeGlobalMetadata} from './sections/mergeGlobalMetadata.js';
import {mergeTerraformationLevels} from './sections/mergeTerraformationLevels.js';
import {mergePlayers} from './sections/mergePlayers.js';
import {mergeWorldObjects} from './sections/mergeWorldObjects.js';
import {mergeInventories} from './sections/mergeInventories.js';
import {mergeStatistics} from './sections/mergeStatistics.js';
import {mergeMailboxes} from './sections/mergeMailboxes.js';
import {mergeStoryEvents} from './sections/mergeStoryEvents.js';
import {mergeSaveConfigurations} from './sections/mergeSaveConfigurations.js';
import {mergeTerrainLayers} from './sections/mergeTerrainLayers.js';
import {mergeWorldEvents} from './sections/mergeWorldEvents.js';
import {determineSaveOrder} from './helpers/determineSaveOrder.js';
import {collectEjectedPlayerInventoryIds} from './helpers/collectEjectedPlayerInventoryIds.js';

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

  const [mainSave, secondarySave] = determineSaveOrder(parsedSaveA.sections, parsedSaveB.sections);

  const [metadataA = [], terraformationLevelsA = [], playersA = [], worldObjectsFactoryA = () => EMPTY_GENERATOR(), inventoriesA = [], statisticsA = [], mailboxA = [], storyEventsA = [], saveConfigurationsA = [], terrainLayersA = [], worldEventsA = []] = mainSave;
  const [metadataB = [], terraformationLevelsB = [], playersB = [], worldObjectsFactoryB = () => EMPTY_GENERATOR(), inventoriesB = [], statisticsB = [], mailboxB = [], storyEventsB = [], saveConfigurationsB = [], terrainLayersB = [], worldEventsB = []] = secondarySave;

  const saveAWorldObjectIds = new Set();

  function mergeSaves() {
    const ejectedPlayerIds = collectEjectedPlayerInventoryIds(playersA, playersB, inventoriesB);

    const {serialized: serializedWorldObjects, saveAWorldObjectIds: collectedIds} = mergeWorldObjects(worldObjectsFactoryA(), worldObjectsFactoryB(), ejectedPlayerIds.orphanWorldObjectIds);
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
    indexFileA: mainSave === parsedSaveA.sections ? 0 : 1,
    indexFileB: secondarySave === parsedSaveB.sections ? 1 : 0
  };
}


