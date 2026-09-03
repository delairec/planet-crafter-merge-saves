/** @import { ParsedSave } from './gameDefinitions' */

import {normalizeRawSections} from './normalizeRawSections.js';
import {verifySectionCount} from './verifySectionCount.js';

/**
 * Parses a Planet Crafter save string into 10 typed sections (current format; the Terrain Layers
 * section was removed from the save format by a game update).
 * Section 3 (WorldObjects) is a Generator factory; all others are arrays.
 * Legacy saves (still containing Terrain Layers) are transparently adapted to the current format —
 * see `normalizeRawSections.js` — and produce a warning instead of an error.
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
        return () => createSectionEntriesGenerator(section, errors);
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

/**
 * @param {string} section
 * @param {string[]} errors - shared with the `ParsedSave` returned by `parseSaveSections`; a
 * malformed line is only discovered once this generator is iterated, so errors are pushed here
 * rather than returned.
 */
function* createSectionEntriesGenerator(section, errors) {
  if (!section.trim()) {
    return;
  }

  for (const line of section.split('|\n')) {
    try {
      yield JSON.parse(line);
    } catch {
      errors.push(`Failed to parse world object line: ${line}`);
    }
  }
}
