/** @import { ParsedSave } from '../util-types/js/types.js' */

/**
 * Parses a Planet Crafter save string into 11 typed sections.
 * Section 3 (WorldObjects) is a Generator factory; all others are arrays.
 * @param {string} save
 * @returns {ParsedSave}
 */
export function parseSaveSections(save) {

  const sections = save.split('@');

  return /** @type {ParsedSave} */ ({
    sections: sections.map((section, index) => {
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
