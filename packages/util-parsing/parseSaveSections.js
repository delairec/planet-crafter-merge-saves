/** @import { ParsedSave } from '../util-types/gameDefinitions' */

import {normalizeRawSections, verifySectionCount} from './normalizeSaveSections.js';

import {normalizeRawSections, verifySectionCount} from './normalizeSaveSections.js';

/**
 * Parses a Planet Crafter save string into 10 typed sections (current format; the Terrain Layers
 * section was removed from the save format by a game update).
 * Section 3 (WorldObjects) is a Generator factory; all others are arrays.
 * Legacy saves (still containing Terrain Layers) are transparently adapted to the current format —
 * see `normalizeSaveSections.js` — and produce a warning instead of an error.
 * @param {string} save
 * @returns {ParsedSave}
 */
export function parseSaveSections(save) {

  const rawSections = save.split('@');

  const errors = verifySectionCount(rawSections);
  const {sections: normalizedSections, warnings} = normalizeRawSections(rawSections);

  return /** @type {ParsedSave} */ ({
    errors,
    warnings,
    sections: normalizedSections.map((section, index) => {
      if (isWorldObjectsSection(index)) {
        return () => createSectionEntriesGenerator(section);
      }

      try {
        if (section.includes('|')) {
          return section.split('|\n').map(line => JSON.parse(line)).filter(Boolean);
        }

        return [JSON.parse(section)];
      } catch (error) {
        return [];
      }
    })
  });
}

function isWorldObjectsSection(index) {
  return index === 3;
}

function* createSectionEntriesGenerator(section) {
  if (!section.trim()) {
    return;
  }

  for (const line of section.split('|\n')) {
    try {
      yield JSON.parse(line);
    } catch {
      console.log('Failed to parse world object line:', line);
    }
  }
}
