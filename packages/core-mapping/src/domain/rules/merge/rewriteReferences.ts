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
  return {
    fromSaveA: players.fromSaveA,
    fromSaveB: players.fromSaveB.map(player => ({
      ...player,
      inventoryId: remapId(player.inventoryId, remappings.inventoryIds),
      equipmentId: remapId(player.equipmentId, remappings.inventoryIds)
    }))
  };
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
 * Rewrites the contents of every save B inventory, so an inventory keeps holding the world objects
 * it held whatever identifiers they were given.
 *
 * A save A inventory only ever lists save A world objects, whose identifiers are authoritative and
 * never change, so it is left alone.
 *
 * @see GR-ID-3, GR-ID-5 in docs/game-rules.md
 */
export function rewriteInventoryReferences(inventories: EntriesByOrigin<Inventory>, remappings: IdRemappings): EntriesByOrigin<Inventory> {
  return {
    fromSaveA: inventories.fromSaveA,
    fromSaveB: inventories.fromSaveB.map(inventory => ({
      ...inventory,
      woIds: remapIdList(inventory.woIds, remappings.worldObjectIds)
    }))
  };
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
