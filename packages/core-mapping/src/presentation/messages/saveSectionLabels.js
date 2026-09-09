import {
  GLOBAL_METADATA_SECTION_INDEX,
  INVENTORIES_SECTION_INDEX,
  MAILBOX_MESSAGES_SECTION_INDEX,
  PLAYERS_SECTION_INDEX,
  SAVE_CONFIGURATION_SECTION_INDEX,
  STATISTICS_SECTION_INDEX,
  STORY_EVENTS_SECTION_INDEX,
  TERRAFORMATION_LEVELS_SECTION_INDEX,
  WORLD_EVENTS_SECTION_INDEX,
  WORLD_OBJECTS_SECTION_INDEX
} from 'shared-save-processing/sectionIndexes.js';

/**
 * User-facing name of every save section, indexed the way the save file numbers them. A section
 * missing from the table falls back to its bare index in `formatErrorLocation`, and
 * `formatErrorLocation.spec.ts` fails as soon as one of the ten sections relies on that fallback.
 * @type {Record<number, string>}
 */
export const saveSectionLabels = {
  [GLOBAL_METADATA_SECTION_INDEX]: 'Global metadata',
  [TERRAFORMATION_LEVELS_SECTION_INDEX]: 'Terraformation levels',
  [PLAYERS_SECTION_INDEX]: 'Players',
  [WORLD_OBJECTS_SECTION_INDEX]: 'World objects',
  [INVENTORIES_SECTION_INDEX]: 'Inventories',
  [STATISTICS_SECTION_INDEX]: 'Statistics',
  [MAILBOX_MESSAGES_SECTION_INDEX]: 'Mailbox messages',
  [STORY_EVENTS_SECTION_INDEX]: 'Story events',
  [SAVE_CONFIGURATION_SECTION_INDEX]: 'Save configuration',
  [WORLD_EVENTS_SECTION_INDEX]: 'World events'
};
