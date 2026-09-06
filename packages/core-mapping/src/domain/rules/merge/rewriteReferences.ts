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
    fromSaveB: worldObjects.fromSaveB.map(worldObject => ({
      ...worldObject,
      liId: remapOptionalId(worldObject.liId, remappings.inventoryIds),
      siIds: remapOptionalIdList(worldObject.siIds, remappings.inventoryIds),
      linkedWo: remapOptionalId(worldObject.linkedWo, remappings.worldObjectIds),
      woIds: remapOptionalIdList(worldObject.woIds, remappings.worldObjectIds)
    }))
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

/** A field absent from the save stays absent: `undefined` is dropped when the entry is serialized. */
function remapOptionalId(id: number | undefined, remapping: ReadonlyMap<number, number>): number | undefined {
  return id === undefined ? undefined : remapId(id, remapping);
}

/** A field absent from the save stays absent: `undefined` is dropped when the entry is serialized. */
function remapOptionalIdList(idList: string | undefined, remapping: ReadonlyMap<number, number>): string | undefined {
  return idList === undefined ? undefined : remapIdList(idList, remapping);
}

function remapIdList(idList: string, remapping: ReadonlyMap<number, number>): string {
  if (!idList) {
    return idList;
  }

  return idList
    .split(ID_LIST_SEPARATOR)
    .map(id => {
      const remappedId = remapping.get(Number(id));
      return remappedId === undefined ? id : String(remappedId);
    })
    .join(ID_LIST_SEPARATOR);
}
