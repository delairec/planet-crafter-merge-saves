import type {ParsedSections} from 'shared-save-processing/gameDefinitions';
import {mergeGlobalMetadata} from './mergeGlobalMetadata.ts';
import {mergeTerraformationLevels} from './mergeTerraformationLevels.ts';
import {mergePlayers} from './mergePlayers.ts';
import {mergeWorldObjects} from './mergeWorldObjects.ts';
import {mergeInventories} from './mergeInventories.ts';
import {mergeStatistics} from './mergeStatistics.ts';
import {mergeMailboxes} from './mergeMailboxes.ts';
import {mergeStoryEvents} from './mergeStoryEvents.ts';
import {mergeSaveConfigurations} from './mergeSaveConfigurations.ts';
import {mergeWorldEvents} from './mergeWorldEvents.ts';
import {determineSaveOrder} from './determineSaveOrder.ts';
import {collectEjectedPlayerInventoryIds} from './collectEjectedPlayerInventoryIds.ts';
import type {MergedSaveSections} from './MergedSaveSections.ts';

function* EMPTY_GENERATOR(): Generator<never> {
}

/**
 * Merges two parsed Planet Crafter saves section by section.
 * If one save has `planetId === 'Prime'` in its configuration, it is promoted to save A.
 * Every section rule receives the sections it needs already defaulted, and returns structured
 * entries: nothing is serialized here.
 * @param saveDisplayName - Overrides `saveDisplayName` in the merged configuration.
 * @see GR-ORDER-1 in docs/game-rules.md
 */
export function mergeSaveSections(sectionsA: ParsedSections, sectionsB: ParsedSections, saveDisplayName: string): MergedSaveSections {
  const [mainSave, secondarySave] = determineSaveOrder(sectionsA, sectionsB);

  const [metadataA = [], terraformationLevelsA = [], playersA = [], worldObjectsFactoryA = () => EMPTY_GENERATOR(), inventoriesA = [], statisticsA = [], mailboxA = [], storyEventsA = [], saveConfigurationsA = [], worldEventsA = []] = mainSave;
  const [metadataB = [], terraformationLevelsB = [], playersB = [], worldObjectsFactoryB = () => EMPTY_GENERATOR(), inventoriesB = [], statisticsB = [], mailboxB = [], storyEventsB = [], saveConfigurationsB = [], worldEventsB = []] = secondarySave;

  const ejectedPlayerIds = collectEjectedPlayerInventoryIds(playersA, playersB, inventoriesB);

  return {
    globalMetadata: mergeGlobalMetadata(metadataA, metadataB),
    terraformationLevels: mergeTerraformationLevels(terraformationLevelsA, terraformationLevelsB),
    players: mergePlayers(playersA, playersB),
    worldObjects: mergeWorldObjects(worldObjectsFactoryA(), worldObjectsFactoryB(), ejectedPlayerIds.orphanWorldObjectIds),
    inventories: mergeInventories(inventoriesA, inventoriesB, ejectedPlayerIds.orphanInventoryIds),
    statistics: mergeStatistics(statisticsA, statisticsB),
    mailboxes: mergeMailboxes(mailboxA, mailboxB),
    storyEvents: mergeStoryEvents(storyEventsA, storyEventsB),
    saveConfiguration: mergeSaveConfigurations(saveConfigurationsA, saveConfigurationsB, saveDisplayName),
    worldEvents: mergeWorldEvents(worldEventsA, worldEventsB)
  };
}
