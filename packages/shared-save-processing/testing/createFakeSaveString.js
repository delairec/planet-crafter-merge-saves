/** @import { GlobalMetadata, TerraformationLevel, Player, WorldObject, Inventory, Statistics, MailboxMessage, StoryEvent, SaveConfiguration, WorldEvent } from '../gameDefinitions' */

/**
 * @typedef {{
 *   globalMetadata?: GlobalMetadata,
 *   terraformationLevels?: TerraformationLevel[],
 *   players?: Player[],
 *   worldObjects?: WorldObject[],
 *   inventories?: Inventory[],
 *   statistics?: Statistics,
 *   mailboxes?: MailboxMessage[],
 *   storyEvents?: StoryEvent[],
 *   saveConfiguration?: SaveConfiguration,
 *   worldEvents?: WorldEvent[]
 * }} FakeSaveOptions
 */

import {stringifyEntry} from '../stringifyEntry.js';

export const DEFAULT_GLOBAL_METADATA = /** @type {GlobalMetadata} */ ({
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
 * Builds a save string in the current format (10 real sections; the Terrain Layers section was
 * removed from the save format by a game update).
 * @param {FakeSaveOptions} options
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
        serializeSection(worldEvents),
    ];

    return sections.join('\n@\n') + '\n@';
}

/**
 * Builds a save string in the legacy format (11 real sections, still containing the Terrain
 * Layers section removed by a later game update). Used to test backward compatibility only.
 * @param {{terrainLayers?: Array<{layerId: string, planet: number, colorBase: string}>} & FakeSaveOptions} options
 * @returns {string}
 */
export function createLegacyFakeSaveString({terrainLayers = [], ...options}) {
    const currentFormatSave = createFakeSaveString(options);
    // The separator right before World Events (the last real section) is where Terrain Layers used to be.
    const separator = '\n@\n';
    const worldEventsSeparatorIndex = currentFormatSave.lastIndexOf(separator);
    const beforeWorldEvents = currentFormatSave.slice(0, worldEventsSeparatorIndex + separator.length);
    const worldEventsAndTerminator = currentFormatSave.slice(worldEventsSeparatorIndex + separator.length);

    return beforeWorldEvents + serializeSection(terrainLayers) + separator + worldEventsAndTerminator;
}
