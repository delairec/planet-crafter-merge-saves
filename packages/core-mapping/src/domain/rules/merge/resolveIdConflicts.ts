import type {MergedSaveSections} from './MergedSaveSections.ts';
import {createIdSequence} from './createIdSequence.ts';
import {resolvePlayerIdConflicts} from './resolvePlayerIdConflicts.ts';
import {resolveInventoryIdConflicts} from './resolveInventoryIdConflicts.ts';
import {resolveWorldObjectIdConflicts} from './resolveWorldObjectIdConflicts.ts';
import {rewriteInventoryReferences, rewritePlayerReferences, rewriteWorldObjectReferences} from './rewriteReferences.ts';

/**
 * Renumbers the save B entries whose identifier is already used in save A, then points every save B
 * back-reference at the new identifiers.
 *
 * Runs on the merged sections, as the last step before they are serialized.
 *
 * @see GR-ID-1, GR-ID-2, GR-ID-3, GR-ID-4, GR-ID-5 in docs/game-rules.md
 */
export function resolveIdConflicts(mergedSections: MergedSaveSections): MergedSaveSections {
  const idSequence = createIdSequence([...mergedSections.inventories.fromSaveA, ...mergedSections.inventories.fromSaveB]);

  const players = resolvePlayerIdConflicts(mergedSections.players, idSequence);
  const inventories = resolveInventoryIdConflicts(mergedSections.inventories, idSequence);
  const worldObjects = resolveWorldObjectIdConflicts(mergedSections.worldObjects, idSequence);

  const remappings = {inventoryIds: inventories.saveBIdRemapping, worldObjectIds: worldObjects.saveBIdRemapping};
  return {
    ...mergedSections,
    players: rewritePlayerReferences(players.entries, remappings),
    inventories: rewriteInventoryReferences(inventories.entries, remappings),
    worldObjects: rewriteWorldObjectReferences(worldObjects.entries, remappings)
  };
}
