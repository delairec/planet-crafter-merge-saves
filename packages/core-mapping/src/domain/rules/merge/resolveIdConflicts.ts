import {Inventory, Player, WorldObject} from 'shared-save-processing/gameDefinitions';
import {parseSaveSections} from 'shared-save-processing/parseSaveSections.js';
import {stringifyEntry} from 'shared-save-processing/stringifyEntry.js';
import {serializeSave} from 'shared-save-processing/serializeSave.js';

type IdGenerator = (() => number) & { bumpTo: (id: number) => void };

/**
 * Detects duplicate ids across all merged sections and remaps later occurrences to new unique ids.
 * Updates back-references in Player (inventoryId, equipmentId) and WorldObject (liId, siIds, linkedWo, woIds).
 * Must be called on the raw serialized output of mergeParsedSaveSections().
 * @see GR-ID-1, GR-ID-2, GR-ID-3, GR-ID-4 in docs/game-rules.md
 */
export function resolveIdConflicts(mergedSave: string, saveAWorldObjectIds: Set<number> = new Set()): string {
  const {sections} = parseSaveSections(mergedSave);

  const [
    metadata,
    terraformationLevels,
    players,
    worldObjectsFactory,
    inventories,
    statistics,
    mailboxes,
    storyEvents,
    saveConfigurations,
    worldEvents,
  ] = sections;

  const nextIdGenerator = createIdSequence(inventories);

  const resolvedPlayers = resolvePlayerIdConflicts(players, nextIdGenerator);
  const {resolvedInventories, oldIdToNewIds, saveBInventoryOriginalIds} = resolveInventoryIdConflicts(inventories, nextIdGenerator);
  const {updatedPlayers: playersWithUpdatedRefs, bInventorySlotsTakenByPlayers} = updatePlayerInventoryReferences(resolvedPlayers, oldIdToNewIds);

  const worldObjectIdRemapping = new Map<number, number>();
  const saveBLinkedInventoryIds = new Set<number>();
  const resolvedWorldObjectsGenerator = createResolveWorldObjectsGenerator(worldObjectsFactory(), nextIdGenerator, worldObjectIdRemapping, saveBLinkedInventoryIds);
  const serializedWorldObjects = serializeWorldObjectsAndBuildRemapping(resolvedWorldObjectsGenerator, oldIdToNewIds, saveBInventoryOriginalIds, saveAWorldObjectIds, worldObjectIdRemapping, bInventorySlotsTakenByPlayers);

  const resolvedSaveBLinkedInventoryIds = remapLinkedInventoryIds(saveBLinkedInventoryIds, oldIdToNewIds);
  const inventoriesWithUpdatedWoIds = updateInventoryWoIdsReferences(resolvedInventories, worldObjectIdRemapping, resolvedSaveBLinkedInventoryIds);

  return serializeSave({
    metadata,
    terraformationLevels,
    players: playersWithUpdatedRefs,
    serializedWorldObjects,
    inventories: inventoriesWithUpdatedWoIds,
    statistics,
    mailboxes,
    storyEvents,
    saveConfigurations,
    worldEvents,
  });
}

function createIdSequence(inventories: Inventory[]): IdGenerator {
  let nextId = 1;
  for (const inventory of inventories) if (inventory.id >= nextId) nextId = inventory.id + 1;
  const generate = (() => nextId++) as IdGenerator;
  generate.bumpTo = (id: number) => { if (id >= nextId) nextId = id + 1; };
  return generate;
}

function resolvePlayerIdConflicts(players: Player[], generateNextId: IdGenerator): Player[] {
  const seenIds = new Set<number>();
  return players.map(player => {
    if (seenIds.has(player.id)) {
      return {...player, id: generateNextId()};
    }
    seenIds.add(player.id);
    return player;
  });
}

function resolveInventoryIdConflicts(inventories: Inventory[], generateNextId: IdGenerator) {
  const seenIds = new Set<number>();
  const oldIdToNewIds = new Map<number, number[]>();
  const saveBInventoryOriginalIds = new Set<number>();
  const resolvedInventories = inventories.map(inventory => {
    if (seenIds.has(inventory.id)) {
      const newId = generateNextId();
      if (!oldIdToNewIds.has(inventory.id)) oldIdToNewIds.set(inventory.id, []);
      oldIdToNewIds.get(inventory.id)!.push(newId);
      saveBInventoryOriginalIds.add(inventory.id);
      return {...inventory, id: newId};
    }
    seenIds.add(inventory.id);
    return inventory;
  });
  return {resolvedInventories, oldIdToNewIds, saveBInventoryOriginalIds};
}

function updatePlayerInventoryReferences(players: Player[], oldIdToNewIds: Map<number, number[]>) {
  if (oldIdToNewIds.size === 0) return {updatedPlayers: players, bInventorySlotsTakenByPlayers: new Map<number, number>()};
  const consumedCount = new Map<number, number>();
  const updatedPlayers = players.map(player => {
    return {
      ...player,
      inventoryId: remapRef(player.inventoryId, oldIdToNewIds, consumedCount),
      equipmentId: remapRef(player.equipmentId, oldIdToNewIds, consumedCount),
    };
  });
  const bInventorySlotsTakenByPlayers = computeBSlotsTakenByPlayers(consumedCount);
  return {updatedPlayers, bInventorySlotsTakenByPlayers};
}

function computeBSlotsTakenByPlayers(playerConsumedCount: Map<number, number>): Map<number, number> {
  const slotsTaken = new Map<number, number>();
  for (const [id, count] of playerConsumedCount) {
    slotsTaken.set(id, Math.max(0, count - 1));
  }
  return slotsTaken;
}

function remapRef(refId: number, oldIdToNewIds: Map<number, number[]>, consumedCount: Map<number, number>): number {
  if (!oldIdToNewIds.has(refId)) return refId;
  const consumed = consumedCount.get(refId) ?? 0;
  if (consumed === 0) {
    consumedCount.set(refId, 1);
    return refId;
  }
  const newId = oldIdToNewIds.get(refId)![consumed - 1];
  consumedCount.set(refId, consumed + 1);
  return newId ?? refId;
}

function* createResolveWorldObjectsGenerator(worldObjectsGenerator: Generator<WorldObject>, generateNextId: IdGenerator, worldObjectIdRemapping: Map<number, number>, saveBLinkedInventoryIds: Set<number>): Generator<WorldObject> {
  const seenIds = new Set<number>();
  for (const worldObject of worldObjectsGenerator) {
    generateNextId.bumpTo(worldObject.id);
    if (seenIds.has(worldObject.id)) {
      const newId = generateNextId();
      worldObjectIdRemapping.set(worldObject.id, newId);
      if (worldObject.liId !== undefined) saveBLinkedInventoryIds.add(worldObject.liId);
      yield {...worldObject, id: newId};
    } else {
      seenIds.add(worldObject.id);
      yield worldObject;
    }
  }
}

function remapLinkedInventoryIds(saveBLinkedInventoryIds: Set<number>, oldIdToNewIds: Map<number, number[]>): Set<number> {
  const resolved = new Set<number>();
  for (const id of saveBLinkedInventoryIds) {
    if (oldIdToNewIds.has(id)) {
      const newIds = oldIdToNewIds.get(id)!;
      for (const newId of newIds) resolved.add(newId);
    } else {
      resolved.add(id);
    }
  }
  return resolved;
}

function updateInventoryWoIdsReferences(inventories: Inventory[], worldObjectIdRemapping: Map<number, number>, saveBLinkedInventoryIds: Set<number>): Inventory[] {
  if (worldObjectIdRemapping.size === 0) return inventories;
  return inventories.map(inventory => {
    if (!inventory.woIds) return inventory;
    if (!saveBLinkedInventoryIds.has(inventory.id)) return inventory;
    const updatedWoIds = inventory.woIds
      .split(',')
      .map(id => {
        const numId = Number(id);
        return worldObjectIdRemapping.has(numId) ? String(worldObjectIdRemapping.get(numId)) : id;
      })
      .join(',');
    return {...inventory, woIds: updatedWoIds};
  });
}

/**
 * Returns the remapped inventory id for a B-origin world object reference, or the original id for A-origin.
 */
function remapBWorldObjectInventoryRef(isSaveAWorldObject: boolean, inventoryId: number, oldIdToNewIds: Map<number, number[]>, consumedCount: Map<number, number>): number {
  if (isSaveAWorldObject) return inventoryId;
  const newIds = oldIdToNewIds.get(inventoryId);
  if (!newIds) return inventoryId;
  const consumed = consumedCount.get(inventoryId) ?? 0;
  const newId = newIds[consumed] ?? newIds[newIds.length - 1];
  consumedCount.set(inventoryId, consumed + 1);
  return newId;
}

function serializeWorldObjectsAndBuildRemapping(
  worldObjectsGenerator: Generator<WorldObject>,
  oldIdToNewIds: Map<number, number[]> = new Map(),
  saveBInventoryOriginalIds: Set<number> = new Set(),
  saveAWorldObjectIds: Set<number> = new Set(),
  worldObjectIdRemapping: Map<number, number> = new Map(),
  bInventorySlotsTakenByPlayers: Map<number, number> = new Map()
): string {
  const liIdConsumedCount = new Map(bInventorySlotsTakenByPlayers);
  const siIdsConsumedCount = new Map(bInventorySlotsTakenByPlayers);
  const parts: string[] = [];
  for (let worldObject of worldObjectsGenerator) {
    const isSaveAWorldObject = saveAWorldObjectIds.has(worldObject.id);
    if (worldObject.liId !== undefined && saveBInventoryOriginalIds.has(worldObject.liId)) {
      worldObject = {...worldObject, liId: remapBWorldObjectInventoryRef(isSaveAWorldObject, worldObject.liId, oldIdToNewIds, liIdConsumedCount)};
    }
    if (worldObject.siIds !== undefined && saveBInventoryOriginalIds.size > 0) {
      worldObject = remapSiIds(worldObject as WorldObject & {siIds: string}, isSaveAWorldObject, oldIdToNewIds, saveBInventoryOriginalIds, siIdsConsumedCount);
    }
    if (worldObject.linkedWo !== undefined && worldObjectIdRemapping.has(worldObject.linkedWo)) {
      worldObject = {...worldObject, linkedWo: worldObjectIdRemapping.get(worldObject.linkedWo)};
    }
    parts.push(stringifyEntry(worldObject));
  }
  return parts.join('|\n');
}

function remapSiIds(worldObject: WorldObject & {siIds: string}, isSaveAWorldObject: boolean, oldIdToNewIds: Map<number, number[]>, saveBInventoryOriginalIds: Set<number>, consumedCount: Map<number, number>): WorldObject {
  const updatedSiIds = worldObject.siIds
    .split(',')
    .map(idString => {
      const numId = Number(idString);
      if (!saveBInventoryOriginalIds.has(numId)) return idString;
      return String(remapBWorldObjectInventoryRef(isSaveAWorldObject, numId, oldIdToNewIds, consumedCount));
    })
    .join(',');
  return {...worldObject, siIds: updatedSiIds};
}
