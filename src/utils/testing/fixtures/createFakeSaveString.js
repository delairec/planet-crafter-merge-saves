/** @import { GlobalMetadata, TerraformationLevel, Player, WorldObject, Inventory, Statistics, MailboxMessage, StoryEvent, SaveConfiguration, TerrainLayer, WorldEvent } from '../../../types/js/types.js' */

import {stringifyEntry} from '../../parsing/stringifyEntry.js';

const DEFAULT_GLOBAL_METADATA = /** @type {GlobalMetadata} */ ({
  terraTokens: 0,
  allTimeTerraTokens: 0,
  unlockedGroups: '',
  openedInstanceSeed: 0,
  openedInstanceTimeLeft: 0,
});

export const FAKE_SAVE_CONFIGURATION = /** @type {SaveConfiguration} */ ({
  saveDisplayName: 'Fake Save',
  planetId: 'Prime',
  worldSeed: 0,
  mode: 'standard',
  modded: false,
  version: '13',
  modifierGaugeDrain: 1,
  modifierMeteoOccurence: 1,
  modifierMultiplayerTerraformationFactor: 0.5,
  modifierPowerConsumption: 1,
  modifierTerraformationPace: 1,
});

/**
 * @param {unknown[]} entries
 * @returns {string}
 */
function serializeSection(entries) {
  return entries.map(entry => JSON.stringify(entry)).join('|\n');
}

/**
 * @param {Array<TerraformationLevel | Player | WorldObject | Record<string, unknown>>} entries
 * @returns {string}
 */
function serializeSectionWithStringifyEntry(entries) {
  return entries.map(entry => stringifyEntry(entry)).join('|\n');
}

/**
 * @param {{
 *   globalMetadata?: GlobalMetadata,
 *   terraformationLevels?: TerraformationLevel[],
 *   players?: Player[],
 *   worldObjects?: WorldObject[],
 *   inventories?: Inventory[],
 *   statistics?: Statistics,
 *   mailboxes?: MailboxMessage[],
 *   storyEvents?: StoryEvent[],
 *   saveConfiguration?: SaveConfiguration,
 *   terrainLayers?: TerrainLayer[],
 *   worldEvents?: WorldEvent[]
 * }} options
 * @returns {string}
 */
export function createFakeSaveString({
  globalMetadata = DEFAULT_GLOBAL_METADATA,
  terraformationLevels = [],
  players = [],
  worldObjects = [],
  inventories = [],
  statistics,
  mailboxes = [],
  storyEvents = [],
  saveConfiguration,
  terrainLayers = [],
  worldEvents = []
}) {
  const sections = [
    JSON.stringify(globalMetadata),
    serializeSectionWithStringifyEntry(terraformationLevels),
    serializeSectionWithStringifyEntry(players),
    serializeSectionWithStringifyEntry(worldObjects),
    serializeSection(inventories),
    statistics ? JSON.stringify(statistics) : '',
    serializeSection(mailboxes),
    serializeSection(storyEvents),
    saveConfiguration ? JSON.stringify(saveConfiguration) : '',
    serializeSection(terrainLayers),
    serializeSection(worldEvents),
  ];

  return sections.join('\n@\n') + '\n@';
}

