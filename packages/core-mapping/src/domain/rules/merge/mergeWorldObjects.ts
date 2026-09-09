import {WorldObject} from 'shared-save-processing/gameDefinitions';
import {EntriesByOrigin} from './EntriesByOrigin';

/**
 * @see GR-WO-1, GR-WO-2, GR-WO-3, GR-WO-4 in docs/game-rules.md
 */
export function mergeWorldObjects(worldObjectsGeneratorA: Generator<WorldObject>, worldObjectsGeneratorB: Generator<WorldObject>, orphanWorldObjectIds: Set<number>): EntriesByOrigin<WorldObject> {
  const fromSaveA: WorldObject[] = [];
  const positionKeysFromA = new Set<string>();
  for (const worldObject of worldObjectsGeneratorA) {
    if (worldObject.pos) {
      positionKeysFromA.add(buildWorldObjectPositionKey(worldObject));
    }
    fromSaveA.push(worldObject);
  }

  const fromSaveB: WorldObject[] = [];
  for (const worldObject of worldObjectsGeneratorB) {
    if (orphanWorldObjectIds.has(worldObject.id)) {
      continue;
    }

    if (!worldObject.pos || !positionKeysFromA.has(buildWorldObjectPositionKey(worldObject))) {
      fromSaveB.push(worldObject);
    }
  }

  return {fromSaveA, fromSaveB};
}

function buildWorldObjectPositionKey(worldObject: WorldObject): string {
  return `${worldObject.planet ?? ''}:${worldObject.pos}`;
}
