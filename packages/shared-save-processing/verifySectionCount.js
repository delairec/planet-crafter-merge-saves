/** @import { SaveParseError } from './gameDefinitions' */

import {SAVE_SECTIONS_COUNT} from './sectionIndexes.js';

const SAVE_SECTIONS_PARTS_COUNT = SAVE_SECTIONS_COUNT + 1; // + trailing reserved part

const LEGACY_SAVE_SECTIONS_COUNT = 11; // real sections when Terrain Layers still existed
const LEGACY_SAVE_SECTIONS_PARTS_COUNT = LEGACY_SAVE_SECTIONS_COUNT + 1; // + trailing reserved part

/**
 * @param {string[]} rawParts - result of `save.split('@')`
 * @returns {SaveParseError[]} parse errors, empty when the section count is supported. The count
 * concerns the file as a whole, so the error carries no location.
 */
export function verifySectionCount(rawParts) {
  const errors = [];

  if (rawParts.length !== SAVE_SECTIONS_PARTS_COUNT && rawParts.length !== LEGACY_SAVE_SECTIONS_PARTS_COUNT) {
    errors.push({detail: `Expected ${SAVE_SECTIONS_PARTS_COUNT} sections but found ${rawParts.length}`});
  }

  return errors;
}
