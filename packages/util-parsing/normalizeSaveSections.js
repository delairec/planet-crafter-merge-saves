/**
 * A game update removed the Terrain Layers section from the save format.
 * The **current** (canonical) format used everywhere in this project splits into 11 `@`-separated
 * parts: 10 real sections (indexes 0 to 9) + a trailing reserved empty part (produced by the
 * terminating `@`).
 *
 * **Legacy** saves (created before that update) still contain the Terrain Layers section and split
 * into 12 parts: 11 real sections (Terrain Layers at index 9, World Events at index 10) + the
 * trailing reserved part.
 *
 * Backward compatibility with legacy saves is only handled at the user-input boundary (loading a
 * save file). Everywhere else in the codebase, the canonical 11-part format is assumed.
 */

const CANONICAL_SECTION_COUNT = 10; // real sections in the current save format
const CANONICAL_SPLIT_PARTS_COUNT = CANONICAL_SECTION_COUNT + 1; // + trailing reserved part

const LEGACY_SECTION_COUNT = 11; // real sections when Terrain Layers still existed
const LEGACY_SPLIT_PARTS_COUNT = LEGACY_SECTION_COUNT + 1; // + trailing reserved part
const LEGACY_TERRAIN_LAYERS_SECTION_INDEX = 9;
const LEGACY_WORLD_EVENTS_SECTION_INDEX = 10;

const LEGACY_FORMAT_WARNING = 'This save uses an outdated format (from an ancient version of the game). '
  + 'It has been automatically adapted to the current format; some data may have been discarded in the process.';

/**
 * Adapts the raw `@`-split parts of a save to the current 11-part format.
 * Legacy 12-part saves are converted by dropping the Terrain Layers section and shifting World
 * Events (and the trailing reserved part) up by one index.
 *
 * @param {string[]} rawParts - result of `save.split('@')`
 * @returns {{ sections: string[], warnings: string[] }}
 */
export function normalizeRawSections(rawParts) {
  if (rawParts.length === LEGACY_SPLIT_PARTS_COUNT) {
    return {
      sections: [
        ...rawParts.slice(0, LEGACY_TERRAIN_LAYERS_SECTION_INDEX),
        ...rawParts.slice(LEGACY_WORLD_EVENTS_SECTION_INDEX)
      ],
      warnings: [LEGACY_FORMAT_WARNING]
    };
  }

  return {sections: rawParts, warnings: []};
}

/**
 * @param {string[]} rawParts - result of `save.split('@')`
 * @returns {string[]} validation errors, empty when the section count is supported
 */
export function verifySectionCount(rawParts) {
  const errors = [];

  if (rawParts.length !== CANONICAL_SPLIT_PARTS_COUNT && rawParts.length !== LEGACY_SPLIT_PARTS_COUNT) {
    errors.push(`INVALID: Expected ${CANONICAL_SPLIT_PARTS_COUNT} sections but found ${rawParts.length}`);
  }

  return errors;
}
