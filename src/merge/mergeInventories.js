/** @import { Inventory } from '../types.js' */

/**
 * @param {Inventory[]} inventoriesA
 * @param {Inventory[]} inventoriesB
 * @param {Set<number>} orphanInventoryIds
 * @returns {string}
 * @see GR-INV-1, GR-INV-2, GR-INV-3 in docs/game-rules.md
 */
export function mergeInventories(inventoriesA, inventoriesB, orphanInventoryIds = new Set()) {
  const validatedInventoriesA = inventoriesA ?? [];
  const validatedInventoriesB = (inventoriesB ?? []).filter(inventory => !orphanInventoryIds.has(inventory.id));

  return [...validatedInventoriesA, ...validatedInventoriesB]
    .map(inventory => JSON.stringify(inventory))
    .join('|\n');
}

