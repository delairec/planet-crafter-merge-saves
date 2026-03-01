/** @import { WorldObject } from '../types.js' */

import {stringifyEntry} from '../utils/stringifyEntry.js';

/**
 * @param {Generator<WorldObject>} worldObjectsGeneratorA
 * @param {Generator<WorldObject>} worldObjectsGeneratorB
 * @param {Set<number>} orphanWorldObjectIds
 * @returns {string}
 * @see GR-WO-1, GR-WO-2, GR-WO-3, GR-WO-4 in docs/game-rules.md
 */
export function mergeWorldObjects(worldObjectsGeneratorA, worldObjectsGeneratorB, orphanWorldObjectIds = new Set()) {
  const mergedGenerator = createMergedWorldObjectsGenerator(worldObjectsGeneratorA, worldObjectsGeneratorB, orphanWorldObjectIds);
  return serializeWorldObjects(mergedGenerator);
}

/**
 * @param {Generator<WorldObject>} worldObjectsGeneratorA
 * @param {Generator<WorldObject>} worldObjectsGeneratorB
 * @param {Set<number>} orphanWorldObjectIds
 * @returns {Generator<WorldObject>}
 */
function* createMergedWorldObjectsGenerator(worldObjectsGeneratorA, worldObjectsGeneratorB, orphanWorldObjectIds) {
  const positionKeysFromA = new Set();
  for (const worldObject of worldObjectsGeneratorA) {
    if (worldObject.pos) positionKeysFromA.add(buildWorldObjectPositionKey(worldObject));
    yield worldObject;
  }
  for (const worldObject of worldObjectsGeneratorB) {
    if (orphanWorldObjectIds.has(worldObject.id)) continue;
    if (!worldObject.pos || !positionKeysFromA.has(buildWorldObjectPositionKey(worldObject))) {
      yield worldObject;
    }
  }
}

/**
 * @param {WorldObject} worldObject
 * @returns {string}
 */
function buildWorldObjectPositionKey(worldObject) {
  return `${worldObject.planet ?? ''}:${worldObject.pos}`;
}

/**
 * @param {Generator<WorldObject>} worldObjectsGenerator
 * @returns {string}
 */
function serializeWorldObjects(worldObjectsGenerator) {
  const parts = [];
  for (const worldObject of worldObjectsGenerator) {
    parts.push(stringifyEntry(worldObject));
  }
  return parts.join('|\n');
}

