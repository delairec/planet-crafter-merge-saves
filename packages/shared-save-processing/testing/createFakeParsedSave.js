/** @import { SaveWarningCode } from '../normalizeRawSections.js' */
/** @import { ParsedSave, GlobalMetadata, TerraformationLevel, Player, WorldObject, Inventory, Statistics, MailboxMessage, StoryEvent, SaveConfiguration, WorldEvent } from '../gameDefinitions' */

import {DEFAULT_GLOBAL_METADATA} from './createFakeSaveString.js';

/** @returns {Generator<never>} */
function* EMPTY_GENERATOR() {
}

/**
 * @typedef {Object} FakeParsedSaveOptions
 * @property {GlobalMetadata[]} [globalMetadata]
 * @property {TerraformationLevel[]} [terraformationLevels]
 * @property {Player[]} [players]
 * @property {() => Generator<WorldObject>} [worldObjects]
 * @property {Inventory[]} [inventories]
 * @property {Statistics[]} [statistics]
 * @property {MailboxMessage[]} [mailboxes]
 * @property {StoryEvent[]} [storyEvents]
 * @property {SaveConfiguration[]} [saveConfigurations]
 * @property {WorldEvent[]} [worldEvents]
 * @property {string[]} [errors]
 * @property {SaveWarningCode[]} [warnings]
 */

/**
 * Creates a fake parsed save (see `ParsedSave`) with one override per section, in business
 * language rather than raw section indexes.
 * @param {FakeParsedSaveOptions} [options]
 * @returns {ParsedSave}
 */
export function createFakeParsedSave({
    globalMetadata = [DEFAULT_GLOBAL_METADATA],
    terraformationLevels = [],
    players = [],
    worldObjects = () => EMPTY_GENERATOR(),
    inventories = [],
    statistics = [],
    mailboxes = [],
    storyEvents = [],
    saveConfigurations = [],
    worldEvents = [],
    errors = [],
    warnings = [],
} = {}) {
    return {
        errors,
        warnings,
        sections: [
            globalMetadata,
            terraformationLevels,
            players,
            worldObjects,
            inventories,
            statistics,
            mailboxes,
            storyEvents,
            saveConfigurations,
            worldEvents,
            []
        ]
    };
}
