import {parseSaveSections} from './parseSaveSections.js';
import {stringifyEntry} from './stringifyEntry.js';

/**
 * @param {string} mergedSave
 * @returns {string}
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
  const playersWithUpdatedRefs = updatePlayerInventoryReferences(resolvedPlayers, oldIdToNewIds);

  const worldObjectIdRemapping = new Map();
  const resolvedWorldObjectsGenerator = createResolveWorldObjectsGenerator(worldObjectsGenerator, nextIdGenerator, worldObjectIdRemapping);
  const serializedWorldObjects = serializeWorldObjectsAndBuildRemapping(resolvedWorldObjectsGenerator, oldIdToAllResolvedIds);

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
  if (oldIdToNewIds.size === 0) return players;
  const consumedCount = new Map();
  return players.map(player => {
    return {
      ...player,
      inventoryId: remapRef(player.inventoryId, oldIdToNewIds, consumedCount),
      equipmentId: remapRef(player.equipmentId, oldIdToNewIds, consumedCount),
    };
  });
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

function serializeWorldObjectsAndBuildRemapping(worldObjectsGenerator, oldIdToAllResolvedIds = new Map()) {
  const consumedCount = new Map();
  const parts = [];
  for (let worldObject of worldObjectsGenerator) {
    if (worldObject.liId !== undefined && oldIdToAllResolvedIds.has(worldObject.liId)) {
      const resolvedIds = oldIdToAllResolvedIds.get(worldObject.liId);
      const consumed = consumedCount.get(worldObject.liId) ?? 0;
      const newLiId = resolvedIds[consumed] ?? resolvedIds[resolvedIds.length - 1];
      consumedCount.set(worldObject.liId, consumed + 1);
      worldObject = {...worldObject, liId: newLiId};
    }
    parts.push(stringifyEntry(worldObject));
  }
  return parts.join('|\n');
}

function serializeSave({metadata, terraformationLevels, players, serializedWorldObjects, inventories, statistics, mailboxes, storyEvents, saveConfigurations, terrainLayers, worldEvents}) {
  const serialize = entries => entries.map(e => JSON.stringify(e)).join('|\n');
  const serializeWithFloats = entries => entries.map(e => stringifyEntry(e)).join('|\n');
  const serializeSingle = entry => entry ? JSON.stringify(entry) : '';

  const sections = [
    serialize(metadata),
    serializeWithFloats(terraformationLevels),
    serializeWithFloats(players),
    serializedWorldObjects,
    serialize(inventories),
    serializeSingle(statistics[0]),
    serialize(mailboxes),
    serialize(storyEvents),
    serializeSingle(saveConfigurations[0]),
    serialize(terrainLayers),
    serialize(worldEvents),
  ];

  return sections.join('\n@\n') + '\n@';
}
