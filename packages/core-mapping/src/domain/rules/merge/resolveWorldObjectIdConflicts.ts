import {WorldObject} from 'shared-save-processing/gameDefinitions';
import {EntriesByOrigin} from './EntriesByOrigin';
import {IdSequence} from './createIdSequence';
import {ResolvedEntries} from './ResolvedEntries';

/**
 * Gives a new identifier to every save B world object whose identifier is already used in save A.
 *
 * Every world object identifier walked is reserved in the sequence, so a generated identifier never
 * collides with a world object that comes later.
 *
 * @see GR-ID-1, GR-ID-2 in docs/game-rules.md
 */
export function resolveWorldObjectIdConflicts(worldObjects: EntriesByOrigin<WorldObject>, idSequence: IdSequence): ResolvedEntries<WorldObject> {
  const usedIds = new Set<number>();
  const saveBIdRemapping = new Map<number, number>();

  const fromSaveA = worldObjects.fromSaveA.map(worldObject => {
    idSequence.reserve(worldObject.id);
    usedIds.add(worldObject.id);
    return worldObject;
  });

  const fromSaveB = worldObjects.fromSaveB.map(worldObject => {
    idSequence.reserve(worldObject.id);
    if (!usedIds.has(worldObject.id)) {
      usedIds.add(worldObject.id);
      return worldObject;
    }

    const newId = idSequence.next();
    saveBIdRemapping.set(worldObject.id, newId);
    return {...worldObject, id: newId};
  });

  return {entries: {fromSaveA, fromSaveB}, saveBIdRemapping};
}
