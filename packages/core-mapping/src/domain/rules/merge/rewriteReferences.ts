import {Inventory, Player, WorldObject} from 'shared-save-processing/gameDefinitions';
import {EntriesByOrigin} from './EntriesByOrigin';

const ID_LIST_SEPARATOR = ',';

export interface IdRemappings {
  readonly inventoryIds: ReadonlyMap<number, number>;
  readonly worldObjectIds: ReadonlyMap<number, number>;
}

/**
 * Points every save B back-reference at the identifiers save B entries were given.
 *
 * Save A entries are never rewritten: their identifiers are authoritative, so a reference they
 * carry still designates the same entry after the merge. That is what makes the rewriting
 * save-origin-aware without having to guess where an entry came from.
 *
 * @see GR-ID-3, GR-ID-5 in docs/game-rules.md
 */
export function rewritePlayerReferences(players: EntriesByOrigin<Player>, remappings: IdRemappings): EntriesByOrigin<Player> {
  const slotsTaken = new Map<number, number>();
  const rewrite = (player: Player): Player => ({
    ...player,
    inventoryId: takeInventorySlot(player.inventoryId, remappings.inventoryIds, slotsTaken),
    equipmentId: takeInventorySlot(player.equipmentId, remappings.inventoryIds, slotsTaken)
  });

  return {
    fromSaveA: players.fromSaveA.map(rewrite),
    fromSaveB: players.fromSaveB.map(rewrite)
  };
}

/**
 * The first player referencing a renumbered inventory keeps the identifier it used to carry, the
 * next ones get the new one. Save A players are walked first, so they keep theirs.
 *
 * This is narrower than GR-ID-5 reads: a save B player referencing an inventory identifier that no
 * save A player uses also keeps it, and so ends up pointing at the save A inventory that took it.
 * Preserved as is here so the merged output stays unchanged; see the open question on the T11 pull
 * request.
 */
function takeInventorySlot(inventoryId: number, remapping: ReadonlyMap<number, number>, slotsTaken: Map<number, number>): number {
  const newId = remapping.get(inventoryId);
  if (newId === undefined) return inventoryId;

  const alreadyTaken = slotsTaken.get(inventoryId) ?? 0;
  slotsTaken.set(inventoryId, alreadyTaken + 1);
  return alreadyTaken === 0 ? inventoryId : newId;
}

/** @see GR-ID-3, GR-ID-5 in docs/game-rules.md */
export function rewriteWorldObjectReferences(worldObjects: EntriesByOrigin<WorldObject>, remappings: IdRemappings): EntriesByOrigin<WorldObject> {
  return {
    fromSaveA: worldObjects.fromSaveA,
    fromSaveB: worldObjects.fromSaveB.map(worldObject => {
      const rewritten: WorldObject = {...worldObject};
      if (rewritten.liId !== undefined) rewritten.liId = remapId(rewritten.liId, remappings.inventoryIds);
      if (rewritten.siIds !== undefined) rewritten.siIds = remapIdList(rewritten.siIds, remappings.inventoryIds);
      if (rewritten.linkedWo !== undefined) rewritten.linkedWo = remapId(rewritten.linkedWo, remappings.worldObjectIds);
      if (rewritten.woIds !== undefined) rewritten.woIds = remapIdList(rewritten.woIds, remappings.worldObjectIds);
      return rewritten;
    })
  };
}

/**
 * Rewrites the contents of the inventories owned by a renumbered world object.
 *
 * Only those inventories are rewritten, which is narrower than GR-ID-3 reads: an inventory holding
 * a renumbered world object it does not own keeps a stale identifier. Preserved as is here so the
 * merged output stays unchanged; see the open question on the T11 pull request.
 *
 * @see GR-ID-3, GR-ID-5 in docs/game-rules.md
 */
export function rewriteInventoryReferences(inventories: EntriesByOrigin<Inventory>, remappings: IdRemappings, inventoryIdsOwnedByRenumberedWorldObjects: ReadonlySet<number>): EntriesByOrigin<Inventory> {
  const rewriteContents = (inventory: Inventory): Inventory => {
    if (!inventoryIdsOwnedByRenumberedWorldObjects.has(inventory.id)) return inventory;
    return {...inventory, woIds: remapIdList(inventory.woIds, remappings.worldObjectIds)};
  };

  return {
    fromSaveA: inventories.fromSaveA.map(rewriteContents),
    fromSaveB: inventories.fromSaveB.map(rewriteContents)
  };
}

/**
 * Identifiers of the inventories owned by a save B world object that was renumbered, as they read
 * after the inventories themselves were renumbered.
 *
 * Takes the world objects as they were before resolution, so a renumbered one is still recognised
 * by the identifier it used to carry.
 */
export function collectInventoryIdsOwnedByRenumberedWorldObjects(worldObjectsBeforeResolution: EntriesByOrigin<WorldObject>, remappings: IdRemappings): ReadonlySet<number> {
  const inventoryIds = new Set<number>();

  for (const worldObject of worldObjectsBeforeResolution.fromSaveB) {
    if (worldObject.liId === undefined) continue;
    if (!remappings.worldObjectIds.has(worldObject.id)) continue;
    inventoryIds.add(remapId(worldObject.liId, remappings.inventoryIds));
  }

  return inventoryIds;
}

function remapId(id: number, remapping: ReadonlyMap<number, number>): number {
  return remapping.get(id) ?? id;
}

function remapIdList(idList: string, remapping: ReadonlyMap<number, number>): string {
  if (!idList) return idList;

  return idList
    .split(ID_LIST_SEPARATOR)
    .map(id => {
      const remappedId = remapping.get(Number(id));
      return remappedId === undefined ? id : String(remappedId);
    })
    .join(ID_LIST_SEPARATOR);
}
