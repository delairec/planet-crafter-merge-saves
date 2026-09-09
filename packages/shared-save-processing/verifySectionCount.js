/** @import { SaveParseError } from './gameDefinitions' */

const CANONICAL_SECTION_COUNT = 10; // real sections in the current save format
const CANONICAL_SPLIT_PARTS_COUNT = CANONICAL_SECTION_COUNT + 1; // + trailing reserved part

const LEGACY_SECTION_COUNT = 11; // real sections when Terrain Layers still existed
const LEGACY_SPLIT_PARTS_COUNT = LEGACY_SECTION_COUNT + 1; // + trailing reserved part

/**
 * @param {string[]} rawParts - result of `save.split('@')`
 * @returns {SaveParseError[]} parse errors, empty when the section count is supported. The count
 * concerns the file as a whole, so the error carries no location.
 */
export function verifySectionCount(rawParts) {
  const errors = [];

  if (rawParts.length !== CANONICAL_SPLIT_PARTS_COUNT && rawParts.length !== LEGACY_SPLIT_PARTS_COUNT) {
    errors.push({detail: `Expected ${CANONICAL_SPLIT_PARTS_COUNT} sections but found ${rawParts.length}`});
  }

  return errors;
}
