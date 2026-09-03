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

const LEGACY_SECTION_COUNT = 11; // real sections when Terrain Layers still existed
const LEGACY_SPLIT_PARTS_COUNT = LEGACY_SECTION_COUNT + 1; // + trailing reserved part
const LEGACY_TERRAIN_LAYERS_SECTION_INDEX = 9;
const LEGACY_WORLD_EVENTS_SECTION_INDEX = 10;

/** Warning code reported when a legacy save had to be adapted; presentation maps it to user text. */
export const LEGACY_SAVE_FORMAT_WARNING = 'legacy-save-format';

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
      warnings: [LEGACY_SAVE_FORMAT_WARNING]
    };
  }

  return {sections: rawParts, warnings: []};
}
