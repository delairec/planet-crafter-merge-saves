/** @import { ParsedSave, SaveParseError } from './gameDefinitions' */

import {normalizeRawSections} from './normalizeRawSections.js';
import {verifySectionCount} from './verifySectionCount.js';
import {WORLD_OBJECTS_SECTION_INDEX} from './sectionIndexes.js';

/** Head of the offending line, enough to recognise it without printing a whole entry. */
const REPORTED_LINE_LENGTH = 60;

/**
 * Parses a Planet Crafter save string into the 11 sections of the current format (indexes 0 to 10;
 * section 10 is the reserved empty part produced by the terminating `@`, and the Terrain Layers
 * section was removed from the save format by a game update).
 * Section 3 (WorldObjects) is a Generator factory; all others are arrays.
 * Legacy saves (still containing Terrain Layers) are transparently adapted to the current format —
 * see `normalizeRawSections.js` — and produce a warning instead of an error.
 *
 * A line that cannot be read is reported in `errors` with its location, and never takes the
 * section holding it down with it. This module is the only place in the production code where a
 * save line reaches `JSON.parse`: a second reader tolerating the same format differently is what
 * kept a lost section invisible until now.
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
    sections: normalizedSections.map((section, sectionIndex) => {
      if (isWorldObjectsSection(sectionIndex)) {
        return () => createSectionEntriesGenerator(section, sectionIndex, errors);
      }

      return [...createSectionEntriesGenerator(section, sectionIndex, errors)];
    })
  });
}

function isWorldObjectsSection(sectionIndex) {
  return sectionIndex === WORLD_OBJECTS_SECTION_INDEX;
}

/**
 * Lines of a section, in the order the file holds them. Trimming the section is what makes a real
 * save readable: the part the terminating `@` reserves holds nothing, and the game writes a line
 * break before the first entry of a section.
 * @param {string} section
 * @returns {string[]}
 */
function splitSectionLines(section) {
  const trimmedSection = section.trim();

  return trimmedSection ? trimmedSection.split('|\n') : [];
}

/**
 * @param {string} section
 * @param {number} sectionIndex
 * @param {SaveParseError[]} errors - shared with the `ParsedSave` returned by `parseSaveSections`;
 * an unreadable line of the world objects section is only discovered once this generator is
 * iterated, so errors are pushed here rather than returned.
 * @returns {Generator<unknown>}
 */
function* createSectionEntriesGenerator(section, sectionIndex, errors) {
  for (const [entryIndex, line] of splitSectionLines(section).entries()) {
    let entry;

    try {
      entry = JSON.parse(line);
    } catch {
      errors.push({
        detail: `Invalid JSON: ${line.slice(0, REPORTED_LINE_LENGTH)}`,
        section: sectionIndex,
        entryIndex,
        line
      });
      continue;
    }

    if (entry !== null && entry !== undefined) {
      yield entry;
    }
  }
}
