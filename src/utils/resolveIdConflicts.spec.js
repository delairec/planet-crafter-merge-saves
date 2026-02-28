import {describe, it} from 'node:test';
import {equal} from 'node:assert/strict';
import {resolveIdConflicts} from './resolveIdConflicts.js';
import {parseSaveSections} from './parseSaveSections.js';
import {createFakeSaveString} from '../testing/createFakeSaveString.js';

const parseSection = (raw) => raw.trim().split(/\|\r?\n/).map(l => l.trim()).filter(Boolean).map(l => JSON.parse(l));

const basePlayer = {
  playerPosition: '0,0,0',
  playerRotation: '0,0,0,0',
  playerGaugeOxygen: 280.0,
  playerGaugeThirst: 96.0,
  playerGaugeHealth: 72.0,
  playerGaugeToxic: 0.0,
  host: true,
  planetId: 'Toxicity'
};

describe('resolveIdConflicts', () => {
  describe('All inventories are kept regardless of player references', () => {
    it('should keep an inventory referenced by a world object liId even if no player references it', () => {
      // Arrange — a world object references inventoryId 99 via liId, but no player does.
      const playerFromA = {...basePlayer, id: 1, name: 'Rrose', inventoryId: 10, equipmentId: 11, host: true};
      const worldObjectWithInventory = {id: 200, gId: 'Container', liId: 99, pos: '0,1,0', rot: '0,0,0,1', planet: 110910047};
      const playerInventory = {id: 10, woIds: '', size: 10};
      const playerEquipment = {id: 11, woIds: '', size: 10};
      const worldObjectInventory = {id: 99, woIds: '', size: 50};
      const mergedSave = createFakeSaveString({
        players: [playerFromA],
        worldObjects: [worldObjectWithInventory],
        inventories: [playerInventory, playerEquipment, worldObjectInventory]
      });

      // Act
      const result = resolveIdConflicts(mergedSave);

      // Assert — all 3 inventories must be kept
      const sections = result.split('@');
      const inventories = parseSection(sections[4]);
      equal(inventories.length, 3);
      equal(inventories.some(inv => inv.id === 99), true);
    });

    it('should keep world object inventories from both saves when there is no id conflict', () => {
      // Arrange — two world objects from different saves each have their own inventory
      const playerFromA = {...basePlayer, id: 1, name: 'Rrose', inventoryId: 10, equipmentId: 11, host: true};
      const worldObjectA = {id: 200, gId: 'Container', liId: 99, pos: '0,1,0', rot: '0,0,0,1', planet: 110910047};
      const worldObjectB = {id: 201, gId: 'Container', liId: 100, pos: '0,2,0', rot: '0,0,0,1', planet: 110910047};
      const playerInventory = {id: 10, woIds: '', size: 10};
      const playerEquipment = {id: 11, woIds: '', size: 10};
      const worldObjectInventoryA = {id: 99, woIds: '', size: 50};
      const worldObjectInventoryB = {id: 100, woIds: '', size: 60};
      const mergedSave = createFakeSaveString({
        players: [playerFromA],
        worldObjects: [worldObjectA, worldObjectB],
        inventories: [playerInventory, playerEquipment, worldObjectInventoryA, worldObjectInventoryB]
      });

      // Act
      const result = resolveIdConflicts(mergedSave);

      // Assert — all 4 inventories must be kept
      const sections = result.split('@');
      const inventories = parseSection(sections[4]);
      equal(inventories.length, 4);
      equal(inventories.some(inv => inv.id === 99), true);
      equal(inventories.some(inv => inv.id === 100), true);
    });

    it('should keep all inventories even when duplicate ids are resolved and an inventory has no player or world object reference', () => {
      // Arrange — 3 inventories share id:10. After resolution, all 3 get unique ids and all are kept.
      const playerFromA = {...basePlayer, id: 1, name: 'Rrose', inventoryId: 10, equipmentId: 11, host: true};
      const playerFromB = {...basePlayer, id: 2, name: 'Chillie', inventoryId: 10, equipmentId: 21, host: false};
      const inventoryFromA = {id: 10, woIds: '', size: 10};
      const inventoryFromB = {id: 10, woIds: '', size: 20};
      const extraInventory = {id: 10, woIds: '', size: 99};
      const mergedSave = createFakeSaveString({
        players: [playerFromA, playerFromB],
        inventories: [inventoryFromA, inventoryFromB, extraInventory, {id: 11, woIds: '', size: 10}, {id: 21, woIds: '', size: 10}]
      });

      // Act
      const result = resolveIdConflicts(mergedSave);

      // Assert — all 5 inventories must be kept with unique ids
      const sections = result.split('@');
      const inventories = parseSection(sections[4]);
      const ids = inventories.map(inv => inv.id);
      equal(inventories.length, 5);
      equal(new Set(ids).size, 5);
      equal(inventories.some(inv => inv.size === 99), true);
    });
  });

  describe('When there are no id conflicts', () => {    it('should return the save unchanged', () => {
      // Arrange
      const player = {id: 1, name: 'Rrose', inventoryId: 10, equipmentId: 11, playerPosition: '0,0,0', playerRotation: '0,0,0,0', playerGaugeOxygen: 280.0, playerGaugeThirst: 96.0, playerGaugeHealth: 72.0, playerGaugeToxic: 0.0, host: true, planetId: 'Toxicity'};
      const worldObject = {id: 100, gId: 'SomeObject', pos: '100,200,300', rot: '0,0,0,1', planet: 110910047};
      const mergedSave = createFakeSaveString({
        players: [player],
        worldObjects: [worldObject],
        inventories: [{id: 10, woIds: '100', size: 10}, {id: 11, woIds: '', size: 10}]
      });

      // Act
      const result = resolveIdConflicts(mergedSave);

      // Assert
      const sections = result.split('@');
      const players = sections[2].trim().split('|\n').map(l => JSON.parse(l));
      const worldObjects = sections[3].trim().split('|\n').map(l => JSON.parse(l));
      const inventories = sections[4].trim().split('|\n').map(l => JSON.parse(l));

      equal(players[0].id, 1);
      equal(worldObjects[0].id, 100);
      equal(inventories[0].id, 10);
      equal(inventories[0].woIds, '100');
    });
  });



  describe('Player id conflicts', () => {
    it('should assign a new unique id to a player from save B when it shares an id with a player from save A', () => {
      // Arrange
      const playerFromA = {...basePlayer, id: 1, name: 'Rrose', inventoryId: 10, equipmentId: 11, host: true};
      const playerFromB = {...basePlayer, id: 1, name: 'Chillie', inventoryId: 20, equipmentId: 21, host: false};
      const mergedSave = createFakeSaveString({
        players: [playerFromA, playerFromB],
        inventories: [
          {id: 10, woIds: '', size: 10},
          {id: 11, woIds: '', size: 10},
          {id: 20, woIds: '', size: 10},
          {id: 21, woIds: '', size: 10},
        ]
      });

      // Act
      const result = resolveIdConflicts(mergedSave);

      // Assert — playerFromB must have a new id, different from 1
      const sections = result.split('@');
      const players = sections[2].trim().split('|\n').map(l => JSON.parse(l));
      equal(players[0].id, 1);
      equal(players[1].id !== 1, true);
      equal(players[1].name, 'Chillie');
    });
  });

  describe('Inventory id conflicts', () => {
    it('should assign a new unique id to a save B inventory when it shares an id with a save A inventory and update the player reference', () => {
      // Arrange
      const playerFromA = {...basePlayer, id: 1, name: 'Rrose', inventoryId: 10, equipmentId: 11, host: true};
      const playerFromB = {...basePlayer, id: 2, name: 'Chillie', inventoryId: 10, equipmentId: 21, host: false};
      const inventoryFromA = {id: 10, woIds: '', size: 10};
      const inventoryFromB = {id: 10, woIds: '', size: 20};
      const mergedSave = createFakeSaveString({
        players: [playerFromA, playerFromB],
        inventories: [inventoryFromA, inventoryFromB, {id: 11, woIds: '', size: 10}, {id: 21, woIds: '', size: 10}]
      });

      // Act
      const result = resolveIdConflicts(mergedSave);

      // Assert — playerFromB's inventoryId must be updated to the new id
      const sections = result.split('@');
      const players = sections[2].trim().split('|\n').map(l => JSON.parse(l));
      const inventories = sections[4].trim().split('|\n').map(l => JSON.parse(l));

      equal(players[0].inventoryId, 10);
      equal(players[1].inventoryId !== 10, true);
      equal(inventories.find(inv => inv.size === 20).id, players[1].inventoryId);
    });

    it('should assign distinct new ids when both players reference the same duplicated inventory id', () => {
      // Arrange
      const playerFromA = {...basePlayer, id: 1, name: 'Rrose', inventoryId: 10, equipmentId: 11, host: true};
      const playerFromB = {...basePlayer, id: 2, name: 'Chillie', inventoryId: 10, equipmentId: 10, host: false};
      const inventoryFromA = {id: 10, woIds: '', size: 10};
      const inventoryFromB_inv = {id: 10, woIds: '', size: 20};
      const inventoryFromB_equip = {id: 10, woIds: '', size: 5};
      const mergedSave = createFakeSaveString({
        players: [playerFromA, playerFromB],
        inventories: [inventoryFromA, inventoryFromB_inv, inventoryFromB_equip, {id: 11, woIds: '', size: 10}]
      });

      // Act
      const result = resolveIdConflicts(mergedSave);

      // Assert — all three inventories must have distinct ids
      const sections = result.split('@');
      const players = sections[2].trim().split('|\n').map(l => JSON.parse(l));
      const inventories = sections[4].trim().split('|\n').map(l => JSON.parse(l));
      const ids = inventories.map(inv => inv.id);
      const uniqueIds = new Set(ids);

      equal(uniqueIds.size, ids.length);
      equal(players[0].inventoryId, 10);
      equal(players[1].inventoryId !== 10, true);
      equal(players[1].equipmentId !== 10, true);
      equal(players[1].inventoryId !== players[1].equipmentId, true);
    });

    it('should assign a new unique id to a save B equipment and update the player reference', () => {
      // Arrange
      const playerFromA = {...basePlayer, id: 1, name: 'Rrose', inventoryId: 10, equipmentId: 11, host: true};
      const playerFromB = {...basePlayer, id: 2, name: 'Chillie', inventoryId: 20, equipmentId: 11, host: false};
      const equipmentFromA = {id: 11, woIds: '', size: 10};
      const equipmentFromB = {id: 11, woIds: '', size: 20};
      const mergedSave = createFakeSaveString({
        players: [playerFromA, playerFromB],
        inventories: [{id: 10, woIds: '', size: 10}, equipmentFromA, {id: 20, woIds: '', size: 10}, equipmentFromB]
      });

      // Act
      const result = resolveIdConflicts(mergedSave);

      // Assert — playerFromB's equipmentId must be updated to the new id
      const sections = result.split('@');
      const players = sections[2].trim().split('|\n').map(l => JSON.parse(l));
      const inventories = sections[4].trim().split('|\n').map(l => JSON.parse(l));

      equal(players[0].equipmentId, 11);
      equal(players[1].equipmentId !== 11, true);
      equal(inventories.find(inv => inv.size === 20).id, players[1].equipmentId);
    });
  });

  describe('liId references in world objects', () => {
    it('should keep liId unchanged on the first world object when the inventory id has no conflict', () => {
      // Arrange
      const player = {...basePlayer, id: 1, name: 'Rrose', inventoryId: 10, equipmentId: 11, host: true};
      const worldObject = {id: 100, gId: 'Container1', liId: 10, pos: '0,0,0', rot: '0,0,0,1', planet: 110910047};
      const mergedSave = createFakeSaveString({
        players: [player],
        worldObjects: [worldObject],
        inventories: [{id: 10, woIds: '', size: 10}, {id: 11, woIds: '', size: 10}]
      });

      // Act
      const result = resolveIdConflicts(mergedSave);

      // Assert
      const sections = result.split('@');
      const worldObjects = sections[3].trim().split('|\n').map(l => JSON.parse(l));

      equal(worldObjects[0].liId, 10);
    });

    it('should assign resolved ids sequentially to world objects when the referenced inventory id is duplicated', () => {
      // Arrange — two world objects both reference liId: 10, which is duplicated
      const playerFromA = {...basePlayer, id: 1, name: 'Rrose', inventoryId: 10, equipmentId: 11, host: true};
      const playerFromB = {...basePlayer, id: 2, name: 'Chillie', inventoryId: 10, equipmentId: 21, host: false};
      const inventoryFromA = {id: 10, woIds: '', size: 10};
      const inventoryFromB = {id: 10, woIds: '', size: 20};
      const worldObjectA = {id: 100, gId: 'Container1', liId: 10, pos: '0,0,0', rot: '0,0,0,1', planet: 110910047};
      const worldObjectB = {id: 101, gId: 'Container1', liId: 10, pos: '1,0,0', rot: '0,0,0,1', planet: 110910047};
      const mergedSave = createFakeSaveString({
        players: [playerFromA, playerFromB],
        worldObjects: [worldObjectA, worldObjectB],
        inventories: [inventoryFromA, inventoryFromB, {id: 11, woIds: '', size: 10}, {id: 21, woIds: '', size: 10}]
      });

      // Act
      const result = resolveIdConflicts(mergedSave);

      // Assert — first world object keeps liId: 10, second gets the new id
      const sections = result.split('@');
      const players = sections[2].trim().split('|\n').map(l => JSON.parse(l));
      const worldObjects = sections[3].trim().split('|\n').map(l => JSON.parse(l));
      const newInventoryId = players[1].inventoryId;

      equal(worldObjects[0].liId, 10);
      equal(worldObjects[1].liId, newInventoryId);
    });
  });

  describe('World object id conflicts', () => {
    it('should assign a new unique id to a save B world object when it shares an id with a save A world object', () => {
      // Arrange
      const worldObjectFromA = {id: 100, gId: 'SomeObject', pos: '100,200,300', rot: '0,0,0,1', planet: 110910047};
      const worldObjectFromB = {id: 100, gId: 'OtherObject', pos: '400,500,600', rot: '0,0,0,1', planet: 110910047};
      const mergedSave = createFakeSaveString({
        worldObjects: [worldObjectFromA, worldObjectFromB]
      });

      // Act
      const result = resolveIdConflicts(mergedSave);

      // Assert
      const sections = result.split('@');
      const worldObjects = sections[3].trim().split('|\n').map(l => JSON.parse(l));

      equal(worldObjects[0].id, 100);
      equal(worldObjects[1].id !== 100, true);
    });

    it('should generate a new id greater than all existing world object ids', () => {
      // Arrange
      const worldObjectFromA = {id: 500, gId: 'SomeObject', pos: '100,200,300', rot: '0,0,0,1', planet: 110910047};
      const worldObjectFromB = {id: 500, gId: 'OtherObject', pos: '400,500,600', rot: '0,0,0,1', planet: 110910047};
      const playerFromA = {...basePlayer, id: 1, name: 'Rrose', inventoryId: 10, equipmentId: 11, host: true};
      const mergedSave = createFakeSaveString({
        players: [playerFromA],
        worldObjects: [worldObjectFromA, worldObjectFromB],
        inventories: [{id: 10, woIds: '', size: 10}, {id: 11, woIds: '', size: 10}]
      });

      // Act
      const result = resolveIdConflicts(mergedSave);

      // Assert — new id must be greater than 500 (the max world object id)
      const sections = result.split('@');
      const worldObjects = sections[3].trim().split('|\n').map(l => JSON.parse(l));

      equal(worldObjects[1].id > 500, true);
    });

    it('should update woIds references in inventories when a world object id is reassigned', () => {
      // Arrange
      const worldObjectFromA = {id: 100, gId: 'SomeObject', pos: '100,200,300', rot: '0,0,0,1', planet: 110910047};
      const worldObjectFromB = {id: 100, gId: 'OtherObject', pos: '400,500,600', rot: '0,0,0,1', planet: 110910047};
      const playerFromA = {...basePlayer, id: 1, name: 'Rrose', inventoryId: 10, equipmentId: 11, host: true};
      const inventoryWithReference = {id: 10, woIds: '100', size: 10};
      const mergedSave = createFakeSaveString({
        players: [playerFromA],
        worldObjects: [worldObjectFromA, worldObjectFromB],
        inventories: [inventoryWithReference, {id: 11, woIds: '', size: 10}]
      });

      // Act
      const result = resolveIdConflicts(mergedSave);

      // Assert — the new id of worldObjectFromB must appear in the inventory's woIds
      const sections = result.split('@');
      const worldObjects = sections[3].trim().split('|\n').map(l => JSON.parse(l));
      const inventories = sections[4].trim().split('|\n').map(l => JSON.parse(l));
      const newId = worldObjects[1].id;
      const inventory = inventories.find(inv => inv.id === 10);

      equal(inventory.woIds.split(',').includes(String(newId)), true);
    });
  });

  describe('Output format', () => {
    it('should preserve .0 suffix on player gauge integer values', () => {
      // Arrange
      const player = {...basePlayer, id: 1, name: 'Rrose', inventoryId: 10, equipmentId: 11, playerGaugeOxygen: 280.0, playerGaugeToxic: 0.0};
      const mergedSave = createFakeSaveString({
        players: [player],
        inventories: [{id: 10, woIds: '', size: 10}, {id: 11, woIds: '', size: 10}]
      });

      // Act
      const result = resolveIdConflicts(mergedSave);

      // Assert
      const playersSection = result.split('@')[2];
      equal(playersSection.includes('"playerGaugeOxygen":280.0'), true);
      equal(playersSection.includes('"playerGaugeToxic":0.0'), true);
    });

    it('should preserve .0 suffix on terraformation level integer values', () => {
      // Arrange
      const level = {planetId: 'Toxicity', unitOxygenLevel: 2477136019456.0, unitHeatLevel: 2219597103104.0, unitPressureLevel: 2262299836416.0, unitPlantsLevel: 918480420864.0, unitInsectsLevel: 372341538816.0, unitAnimalsLevel: 10118330580992.0, unitPurificationLevel: 2653680304128.0};
      const mergedSave = createFakeSaveString({terraformationLevels: [level]});

      // Act
      const result = resolveIdConflicts(mergedSave);

      // Assert
      const terraSection = result.split('@')[1];
      equal(terraSection.includes('"unitOxygenLevel":2477136019456.0'), true);
    });

    it('should produce a string re-parsable by parseSaveSections with 12 elements', () => {
      // Arrange
      const mergedSave = createFakeSaveString({});

      // Act
      const result = resolveIdConflicts(mergedSave);

      // Assert
      const sections = parseSaveSections(result);
      equal(sections.length, 12);
    });

    it('should preserve all sections in the correct order', () => {
      // Arrange
      const player = {id: 1, name: 'Rrose', inventoryId: 10, equipmentId: 11, playerPosition: '0,0,0', playerRotation: '0,0,0,0', playerGaugeOxygen: 280.0, playerGaugeThirst: 96.0, playerGaugeHealth: 72.0, playerGaugeToxic: 0.0, host: true, planetId: 'Toxicity'};
      const worldObject = {id: 100, gId: 'SomeObject', pos: '100,200,300', rot: '0,0,0,1', planet: 110910047};
      const mergedSave = createFakeSaveString({
        players: [player],
        worldObjects: [worldObject],
        inventories: [{id: 10, woIds: '', size: 10}, {id: 11, woIds: '', size: 10}],
        statistics: {craftedObjects: 10, totalSaveFileLoad: 1, totalSaveFileTime: 100},
        terrainLayers: [{layerId: 'PC-Toxicity-Layer1', planet: 110910047, colorBase: '1-1-1-1'}],
      });

      // Act
      const result = resolveIdConflicts(mergedSave);

      // Assert
      const [, , players, worldObjectsGenerator, inventories, statistics] = parseSaveSections(result);
      equal(players[0].name, 'Rrose');
      equal([...worldObjectsGenerator][0].id, 100);
      equal(inventories[0].id, 10);
      equal(statistics[0].craftedObjects, 10);
    });
  });
});

