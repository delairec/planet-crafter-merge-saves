import {MergedSaveSections} from './MergedSaveSections';
import {createIdSequence} from './createIdSequence';
import {resolveInventoryIdConflicts} from './resolveInventoryIdConflicts';
import {resolveWorldObjectIdConflicts} from './resolveWorldObjectIdConflicts';
import {rewriteInventoryReferences, rewritePlayerReferences, rewriteWorldObjectReferences} from './rewriteReferences';

/**
 * Renumbers the save B inventories and world objects whose identifier is already used in save A,
 * then points every save B back-reference at the new identifiers.
 *
 * Players are left out: their identifier is a Steam account identifier, which no entry references
 * and which the game reuses from one save to the next, so a duplicate between the two saves is not
 * a conflict to resolve.
 *
 * Runs on the merged sections, as the last step before they are serialized.
 *
 * @see GR-ID-1, GR-ID-2, GR-ID-3, GR-ID-4, GR-ID-5 in docs/game-rules.md
 */
export function resolveIdConflicts(mergedSections: MergedSaveSections): MergedSaveSections {
  const idSequence = createIdSequence(
    [...mergedSections.inventories.fromSaveA, ...mergedSections.inventories.fromSaveB],
    [...mergedSections.worldObjects.fromSaveA, ...mergedSections.worldObjects.fromSaveB]
  );

  const inventories = resolveInventoryIdConflicts(mergedSections.inventories, idSequence);
  const worldObjects = resolveWorldObjectIdConflicts(mergedSections.worldObjects, idSequence);

  const remappings = {inventoryIds: inventories.saveBIdRemapping, worldObjectIds: worldObjects.saveBIdRemapping};
  return {
    ...mergedSections,
    players: rewritePlayerReferences(mergedSections.players, remappings),
    inventories: rewriteInventoryReferences(inventories.entries, remappings),
    worldObjects: rewriteWorldObjectReferences(worldObjects.entries, remappings)
  };
}
