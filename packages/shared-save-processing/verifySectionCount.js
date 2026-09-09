/** @import { SaveParseError } from './gameDefinitions' */

import {CANONICAL_DATA_SECTIONS} from './sectionIndexes.js';

const CANONICAL_PARTS = CANONICAL_DATA_SECTIONS + 1; // + trailing reserved part

const LEGACY_DATA_SECTIONS = 11; // real sections when Terrain Layers still existed
const LEGACY_PARTS = LEGACY_DATA_SECTIONS + 1; // + trailing reserved part

/**
 * @param {string[]} rawParts - result of `save.split('@')`
 * @returns {SaveParseError[]} parse errors, empty when the section count is supported. The count
 * concerns the file as a whole, so the error carries no location.
 */
export function verifySectionCount(rawParts) {
  const errors = [];

  if (rawParts.length !== CANONICAL_PARTS && rawParts.length !== LEGACY_PARTS) {
    errors.push({detail: `Expected ${CANONICAL_PARTS} sections but found ${rawParts.length}`});
  }

  return errors;
}
