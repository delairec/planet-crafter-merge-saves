/** @import { GlobalMetadata, TerraformationLevel, Player, Inventory, Statistics, MailboxMessage, StoryEvent, SaveConfiguration, WorldEvent } from '../util-types/gameDefinitions' */

import {stringifyEntry} from './stringifyEntry.js';

/**
 * @typedef {Object} SerializeSaveParams
 * @property {GlobalMetadata[]} metadata
 * @property {TerraformationLevel[]} terraformationLevels
 * @property {Player[]} players
 * @property {string} serializedWorldObjects
 * @property {Inventory[]} inventories
 * @property {Statistics[]} statistics
 * @property {MailboxMessage[]} mailboxes
 * @property {StoryEvent[]} storyEvents
 * @property {SaveConfiguration[]} saveConfigurations
 * @property {WorldEvent[]} worldEvents
 */

const SECTION_SEPARATOR = '\n@\n';
const ENTRY_SEPARATOR = '|\n';
const SAVE_TERMINATOR = '\n@';

/**
 * Assembles the 10 parsed sections back into a Planet Crafter save string.
 * @param {SerializeSaveParams} params
 * @returns {string}
 */
export function serializeSave({metadata, terraformationLevels, players, serializedWorldObjects, inventories, statistics, mailboxes, storyEvents, saveConfigurations, worldEvents}) {
  const serialize = (entries) => entries.map(e => JSON.stringify(e)).join(ENTRY_SEPARATOR);
  const serializeWithFloats = (entries) => entries.map(e => stringifyEntry(e)).join(ENTRY_SEPARATOR);
  const serializeSingle = (entry) => entry ? JSON.stringify(entry) : '';

  const sections = [
    serialize(metadata),
    serializeWithFloats(terraformationLevels),
    serializeWithFloats(players),
    serializedWorldObjects,
    serialize(inventories),
    serializeSingle(statistics[0]),
    serialize(mailboxes),
    serialize(storyEvents),
    serializeSingle(saveConfigurations[0]),
    serialize(worldEvents),
  ];

  return sections.join(SECTION_SEPARATOR) + SAVE_TERMINATOR;
}


