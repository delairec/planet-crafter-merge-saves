import {WorldObject} from 'shared-save-processing/gameDefinitions';
import {stringifyEntry} from 'shared-save-processing/stringifyEntry.js';

export interface MergeWorldObjectsResult {
  serialized: string;
  saveAWorldObjectIds: Set<number>;
}

/**
 * @see GR-WO-1, GR-WO-2, GR-WO-3, GR-WO-4 in docs/game-rules.md
 */
export function mergeWorldObjects(worldObjectsGeneratorA: Generator<WorldObject>, worldObjectsGeneratorB: Generator<WorldObject>, orphanWorldObjectIds: Set<number> = new Set()): MergeWorldObjectsResult {
  const saveAWorldObjectIds = new Set<number>();
  const mergedGenerator = createMergedWorldObjectsGenerator(worldObjectsGeneratorA, worldObjectsGeneratorB, orphanWorldObjectIds, saveAWorldObjectIds);
  const serialized = serializeWorldObjects(mergedGenerator);
  return {serialized, saveAWorldObjectIds};
}

function* createMergedWorldObjectsGenerator(worldObjectsGeneratorA: Generator<WorldObject>, worldObjectsGeneratorB: Generator<WorldObject>, orphanWorldObjectIds: Set<number>, saveAWorldObjectIds: Set<number>): Generator<WorldObject> {
  const positionKeysFromA = new Set<string>();
  for (const worldObject of worldObjectsGeneratorA) {
    if (worldObject.pos) positionKeysFromA.add(buildWorldObjectPositionKey(worldObject));
    saveAWorldObjectIds.add(worldObject.id);
    yield worldObject;
  }
  for (const worldObject of worldObjectsGeneratorB) {
    if (orphanWorldObjectIds.has(worldObject.id)) continue;
    if (!worldObject.pos || !positionKeysFromA.has(buildWorldObjectPositionKey(worldObject))) {
      yield worldObject;
    }
  }
}

function buildWorldObjectPositionKey(worldObject: WorldObject): string {
  return `${worldObject.planet ?? ''}:${worldObject.pos}`;
}

function serializeWorldObjects(worldObjectsGenerator: Generator<WorldObject>): string {
  const parts: string[] = [];
  for (const worldObject of worldObjectsGenerator) {
    parts.push(stringifyEntry(worldObject));
  }
  return parts.join('|\n');
}
