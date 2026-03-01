/** @import { ParsedSave, Player, Inventory, WorldObject } from '../types.js' */

import {parseSaveSections} from './parseSaveSections.js';
import {stringifyEntry} from './stringifyEntry.js';
import {serializeSave} from './serializeSave.js';

/**
 * Detects duplicate ids across all merged sections and remaps later occurrences to new unique ids.
 * Updates back-references in Player (inventoryId, equipmentId) and WorldObject (liId, siIds, linkedWo, woIds).
 * Must be called on the raw serialized output of merge().
 * @param {string} mergedSave
 * @param {Set<number>} [saveAWorldObjectIds] - Set of world object ids that originated from save A.
 * @returns {string}
 * @see GR-ID-1, GR-ID-2, GR-ID-3, GR-ID-4 in docs/game-rules.md
 */
export function resolveIdConflicts(mergedSave, saveAWorldObjectIds = new Set()) {
  const [
    metadata,
    terraformationLevels,
    players,
    worldObjectsGenerator,
    inventories,
    statistics,
    mailboxes,
    storyEvents,
    saveConfigurations,
    terrainLayers,
    worldEvents,
  ] = parseSaveSections(mergedSave);

  const nextIdGenerator = createIdSequence(inventories);

  const resolvedPlayers = resolvePlayerIdConflicts(players, nextIdGenerator);
  const {resolvedInventories, oldIdToNewIds, saveBInventoryOriginalIds} = resolveInventoryIdConflicts(inventories, nextIdGenerator);
  const {updatedPlayers: playersWithUpdatedRefs, bInventorySlotsTakenByPlayers} = updatePlayerInventoryReferences(resolvedPlayers, oldIdToNewIds);

  const worldObjectIdRemapping = new Map();
  const saveBLinkedInventoryIds = new Set();
  const resolvedWorldObjectsGenerator = createResolveWorldObjectsGenerator(worldObjectsGenerator, nextIdGenerator, worldObjectIdRemapping, saveBLinkedInventoryIds);
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
    terrainLayers,
    worldEvents,
  });
}

function createIdSequence(inventories) {
  let nextId = 1;
  for (const inventory of inventories) if (inventory.id >= nextId) nextId = inventory.id + 1;
  const generate = () => nextId++;
  generate.bumpTo = (id) => { if (id >= nextId) nextId = id + 1; };
  return generate;
}

function resolvePlayerIdConflicts(players, generateNextId) {
  const seenIds = new Set();
  return players.map(player => {
    if (seenIds.has(player.id)) {
      return {...player, id: generateNextId()};
    }
    seenIds.add(player.id);
    return player;
  });
}

function resolveInventoryIdConflicts(inventories, generateNextId) {
  const seenIds = new Set();
  const oldIdToNewIds = new Map();
  const saveBInventoryOriginalIds = new Set();
  const resolvedInventories = inventories.map(inventory => {
    if (seenIds.has(inventory.id)) {
      const newId = generateNextId();
      if (!oldIdToNewIds.has(inventory.id)) oldIdToNewIds.set(inventory.id, []);
      oldIdToNewIds.get(inventory.id).push(newId);
      saveBInventoryOriginalIds.add(inventory.id);
      return {...inventory, id: newId};
    }
    seenIds.add(inventory.id);
    return inventory;
  });
  return {resolvedInventories, oldIdToNewIds, saveBInventoryOriginalIds};
}

function updatePlayerInventoryReferences(players, oldIdToNewIds) {
  if (oldIdToNewIds.size === 0) return {updatedPlayers: players, bInventorySlotsTakenByPlayers: new Map()};
  const consumedCount = new Map();
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

function computeBSlotsTakenByPlayers(playerConsumedCount) {
  const slotsTaken = new Map();
  for (const [id, count] of playerConsumedCount) {
    slotsTaken.set(id, Math.max(0, count - 1));
  }
  return slotsTaken;
}

function remapRef(refId, oldIdToNewIds, consumedCount) {
  if (!oldIdToNewIds.has(refId)) return refId;
  const consumed = consumedCount.get(refId) ?? 0;
  if (consumed === 0) {
    consumedCount.set(refId, 1);
    return refId;
  }
  const newId = oldIdToNewIds.get(refId)[consumed - 1];
  consumedCount.set(refId, consumed + 1);
  return newId ?? refId;
}

function* createResolveWorldObjectsGenerator(worldObjectsGenerator, generateNextId, worldObjectIdRemapping, saveBLinkedInventoryIds) {
  const seenIds = new Set();
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

function remapLinkedInventoryIds(saveBLinkedInventoryIds, oldIdToNewIds) {
  const resolved = new Set();
  for (const id of saveBLinkedInventoryIds) {
    if (oldIdToNewIds.has(id)) {
      const newIds = oldIdToNewIds.get(id);
      for (const newId of newIds) resolved.add(newId);
    } else {
      resolved.add(id);
    }
  }
  return resolved;
}

function updateInventoryWoIdsReferences(inventories, worldObjectIdRemapping, saveBLinkedInventoryIds) {
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
 * @param {boolean} isSaveAWorldObject
 * @param {number} inventoryId
 * @param {Map<number, number[]>} oldIdToNewIds
 * @param {Map<number, number>} consumedCount
 * @returns {number}
 */
function remapBWorldObjectInventoryRef(isSaveAWorldObject, inventoryId, oldIdToNewIds, consumedCount) {
  if (isSaveAWorldObject) return inventoryId;
  const newIds = oldIdToNewIds.get(inventoryId);
  if (!newIds) return inventoryId;
  const consumed = consumedCount.get(inventoryId) ?? 0;
  const newId = newIds[consumed] ?? newIds[newIds.length - 1];
  consumedCount.set(inventoryId, consumed + 1);
  return newId;
}

function serializeWorldObjectsAndBuildRemapping(worldObjectsGenerator, oldIdToNewIds = new Map(), saveBInventoryOriginalIds = new Set(), saveAWorldObjectIds = new Set(), worldObjectIdRemapping = new Map(), bInventorySlotsTakenByPlayers = new Map()) {
  const liIdConsumedCount = new Map(bInventorySlotsTakenByPlayers);
  const siIdsConsumedCount = new Map(bInventorySlotsTakenByPlayers);
  const parts = [];
  for (let worldObject of worldObjectsGenerator) {
    const isSaveAWorldObject = saveAWorldObjectIds.has(worldObject.id);
    if (worldObject.liId !== undefined && saveBInventoryOriginalIds.has(worldObject.liId)) {
      worldObject = {...worldObject, liId: remapBWorldObjectInventoryRef(isSaveAWorldObject, worldObject.liId, oldIdToNewIds, liIdConsumedCount)};
    }
    if (worldObject.siIds !== undefined && saveBInventoryOriginalIds.size > 0) {
      worldObject = remapSiIds(worldObject, isSaveAWorldObject, oldIdToNewIds, saveBInventoryOriginalIds, siIdsConsumedCount);
    }
    if (worldObject.linkedWo !== undefined && worldObjectIdRemapping.has(worldObject.linkedWo)) {
      worldObject = {...worldObject, linkedWo: worldObjectIdRemapping.get(worldObject.linkedWo)};
    }
    parts.push(stringifyEntry(worldObject));
  }
  return parts.join('|\n');
}

function remapSiIds(worldObject, isSaveAWorldObject, oldIdToNewIds, saveBInventoryOriginalIds, consumedCount) {
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
