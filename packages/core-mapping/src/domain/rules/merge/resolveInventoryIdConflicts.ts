import type {Inventory} from 'shared-save-processing/gameDefinitions';
import type {EntriesByOrigin} from './EntriesByOrigin.ts';
import type {IdSequence} from './createIdSequence.ts';
import type {ResolvedEntries} from './ResolvedEntries.ts';

/**
 * Gives a new identifier to every save B inventory whose identifier is already used in save A.
 * @see GR-ID-1, GR-ID-2 in docs/game-rules.md
 */
export function resolveInventoryIdConflicts(inventories: EntriesByOrigin<Inventory>, idSequence: IdSequence): ResolvedEntries<Inventory> {
  const usedIds = new Set(inventories.fromSaveA.map(inventory => inventory.id));
  const saveBIdRemapping = new Map<number, number>();

  const fromSaveB = inventories.fromSaveB.map(inventory => {
    if (!usedIds.has(inventory.id)) {
      usedIds.add(inventory.id);
      return inventory;
    }

    const newId = idSequence.next();
    saveBIdRemapping.set(inventory.id, newId);
    return {...inventory, id: newId};
  });

  return {entries: {fromSaveA: inventories.fromSaveA, fromSaveB}, saveBIdRemapping};
}
