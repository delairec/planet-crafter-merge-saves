/** @import { Player, Inventory } from '../types.js' */

/**
 * @param {Player[]} playersA
 * @param {Player[]} playersB
 * @param {Inventory[]} inventoriesB
 * @returns {{ orphanInventoryIds: Set<number>, orphanWorldObjectIds: Set<number> }}
 * @see GR-PLAYER-1, GR-WO-3, GR-INV-2 in docs/game-rules.md
 */
export function collectEjectedPlayerInventoryIds(playersA, playersB, inventoriesB) {
  const ejectedPlayersFromB = (playersB ?? []).filter(playerB =>
    (playersA ?? []).some(playerA => playerA.name === playerB.name)
  );

  const orphanInventoryIds = new Set();
  for (const player of ejectedPlayersFromB) {
    orphanInventoryIds.add(player.inventoryId);
    orphanInventoryIds.add(player.equipmentId);
  }

  const orphanWorldObjectIds = new Set();
  for (const inventory of (inventoriesB ?? [])) {
    if (orphanInventoryIds.has(inventory.id) && inventory.woIds) {
      for (const woId of inventory.woIds.split(',').map(Number).filter(Boolean)) {
        orphanWorldObjectIds.add(woId);
      }
    }
  }

  return {orphanInventoryIds, orphanWorldObjectIds};
}

