import {Inventory} from 'shared-save-processing/gameDefinitions';
import {EntriesByOrigin} from './EntriesByOrigin';

/**
 * @see GR-INV-1, GR-INV-2, GR-INV-3 in docs/game-rules.md
 */
export function mergeInventories(inventoriesA: Inventory[], inventoriesB: Inventory[], orphanInventoryIds: Set<number>): EntriesByOrigin<Inventory> {
  return {
    fromSaveA: inventoriesA,
    fromSaveB: inventoriesB.filter(inventory => !orphanInventoryIds.has(inventory.id))
  };
}
