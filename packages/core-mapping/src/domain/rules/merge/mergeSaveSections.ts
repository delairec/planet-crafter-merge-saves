import {ParsedSections} from 'shared-save-processing/gameDefinitions';
import {mergeGlobalMetadata} from './mergeGlobalMetadata';
import {mergeTerraformationLevels} from './mergeTerraformationLevels';
import {mergePlayers} from './mergePlayers';
import {mergeWorldObjects} from './mergeWorldObjects';
import {mergeInventories} from './mergeInventories';
import {mergeStatistics} from './mergeStatistics';
import {mergeMailboxes} from './mergeMailboxes';
import {mergeStoryEvents} from './mergeStoryEvents';
import {mergeSaveConfigurations} from './mergeSaveConfigurations';
import {mergeWorldEvents} from './mergeWorldEvents';
import {determineSaveOrder} from './determineSaveOrder';
import {collectEjectedPlayerInventoryIds} from './collectEjectedPlayerInventoryIds';
import {MergedSaveSections} from './MergedSaveSections';

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
