/** @import { ParsedSave, Player, Inventory, WorldObject } from '../types.js' */

import {parseSaveSections} from './parseSaveSections.js';
import {stringifyEntry} from './stringifyEntry.js';
import {serializeSave} from './serializeSave.js';

/**
 * Detects duplicate ids across all merged sections and remaps later occurrences to new unique ids.
 * Updates back-references in Player (inventoryId, equipmentId) and WorldObject (liId, woIds).
 * Must be called on the raw serialized output of merge().
 * @param {string} mergedSave
 * @returns {string}
 * @see GR-ID-1, GR-ID-2, GR-ID-3, GR-ID-4 in docs/game-rules.md
 */
export function resolveIdConflicts(mergedSave) {
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
  const {resolvedInventories, oldIdToNewIds, oldIdToAllResolvedIds} = resolveInventoryIdConflicts(inventories, nextIdGenerator);
  const {updatedPlayers: playersWithUpdatedRefs, inventoryConsumedCount} = updatePlayerInventoryReferences(resolvedPlayers, oldIdToNewIds);

  const worldObjectIdRemapping = new Map();
  const resolvedWorldObjectsGenerator = createResolveWorldObjectsGenerator(worldObjectsGenerator, nextIdGenerator, worldObjectIdRemapping);
  const serializedWorldObjects = serializeWorldObjectsAndBuildRemapping(resolvedWorldObjectsGenerator, oldIdToAllResolvedIds, worldObjectIdRemapping, inventoryConsumedCount);

  const inventoriesWithUpdatedWoIds = updateInventoryWoIdsReferences(resolvedInventories, worldObjectIdRemapping);

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
  const oldIdToAllResolvedIds = new Map();
  const resolvedInventories = inventories.map(inventory => {
    if (seenIds.has(inventory.id)) {
      const newId = generateNextId();
      if (!oldIdToNewIds.has(inventory.id)) oldIdToNewIds.set(inventory.id, []);
      oldIdToNewIds.get(inventory.id).push(newId);
      if (!oldIdToAllResolvedIds.has(inventory.id)) oldIdToAllResolvedIds.set(inventory.id, [inventory.id]);
      oldIdToAllResolvedIds.get(inventory.id).push(newId);
      return {...inventory, id: newId};
    }
    seenIds.add(inventory.id);
    return inventory;
  });
  return {resolvedInventories, oldIdToNewIds, oldIdToAllResolvedIds};
}

function updatePlayerInventoryReferences(players, oldIdToNewIds) {
  if (oldIdToNewIds.size === 0) return {updatedPlayers: players, inventoryConsumedCount: new Map()};
  const consumedCount = new Map();
  const updatedPlayers = players.map(player => {
    return {
      ...player,
      inventoryId: remapRef(player.inventoryId, oldIdToNewIds, consumedCount),
      equipmentId: remapRef(player.equipmentId, oldIdToNewIds, consumedCount),
    };
  });
  return {updatedPlayers, inventoryConsumedCount: consumedCount};
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


function* createResolveWorldObjectsGenerator(worldObjectsGenerator, generateNextId, worldObjectIdRemapping) {
  const seenIds = new Set();
  for (const worldObject of worldObjectsGenerator) {
    generateNextId.bumpTo(worldObject.id);
    if (seenIds.has(worldObject.id)) {
      const newId = generateNextId();
      worldObjectIdRemapping.set(worldObject.id, newId);
      yield {...worldObject, id: newId};
    } else {
      seenIds.add(worldObject.id);
      yield worldObject;
    }
  }
}

function updateInventoryWoIdsReferences(inventories, worldObjectIdRemapping) {
  if (worldObjectIdRemapping.size === 0) return inventories;
  return inventories.map(inventory => {
    if (!inventory.woIds) return inventory;
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

function serializeWorldObjectsAndBuildRemapping(worldObjectsGenerator, oldIdToAllResolvedIds = new Map(), worldObjectIdRemapping = new Map(), inventoryConsumedCount = new Map()) {
  const liIdConsumedCount = new Map();
  const siIdsConsumedCount = new Map(inventoryConsumedCount);
  const parts = [];
  for (let worldObject of worldObjectsGenerator) {
    if (worldObject.liId !== undefined && oldIdToAllResolvedIds.has(worldObject.liId)) {
      const resolvedIds = oldIdToAllResolvedIds.get(worldObject.liId);
      const consumed = liIdConsumedCount.get(worldObject.liId) ?? 0;
      const newLiId = resolvedIds[consumed] ?? resolvedIds[resolvedIds.length - 1];
      liIdConsumedCount.set(worldObject.liId, consumed + 1);
      worldObject = {...worldObject, liId: newLiId};
    }
    if (worldObject.siIds !== undefined && oldIdToAllResolvedIds.size > 0) {
      worldObject = remapSiIds(worldObject, oldIdToAllResolvedIds, siIdsConsumedCount);
    }
    if (worldObject.linkedWo !== undefined && worldObjectIdRemapping.has(worldObject.linkedWo)) {
      worldObject = {...worldObject, linkedWo: worldObjectIdRemapping.get(worldObject.linkedWo)};
    }
    parts.push(stringifyEntry(worldObject));
  }
  return parts.join('|\n');
}

function remapSiIds(worldObject, oldIdToAllResolvedIds, consumedCount) {
  const updatedSiIds = worldObject.siIds
    .split(',')
    .map(idString => {
      const numId = Number(idString);
      if (!oldIdToAllResolvedIds.has(numId)) return idString;
      const resolvedIds = oldIdToAllResolvedIds.get(numId);
      const consumed = consumedCount.get(numId) ?? 0;
      const newId = resolvedIds[consumed] ?? resolvedIds[resolvedIds.length - 1];
      consumedCount.set(numId, consumed + 1);
      return String(newId);
    })
    .join(',');
  return {...worldObject, siIds: updatedSiIds};
}

