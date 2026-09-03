import {Inventory} from 'shared-save-processing/gameDefinitions';

/**
 * @see GR-INV-1, GR-INV-2, GR-INV-3 in docs/game-rules.md
 */
export function mergeInventories(inventoriesA: Inventory[], inventoriesB: Inventory[], orphanInventoryIds: Set<number> = new Set()): string {
  const validatedInventoriesA = inventoriesA ?? [];
  const validatedInventoriesB = (inventoriesB ?? []).filter(inventory => !orphanInventoryIds.has(inventory.id));

  return [...validatedInventoriesA, ...validatedInventoriesB]
    .map(inventory => JSON.stringify(inventory))
    .join('|\n');
}
