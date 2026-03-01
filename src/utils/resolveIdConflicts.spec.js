import {describe, it, expect} from 'bun:test';
import {resolveIdConflicts} from './resolveIdConflicts.js';
import {parseSaveSections} from './parseSaveSections.js';
import {createFakeSaveString} from './testing/fixtures/createFakeSaveString.js';

describe('utils/resolveIdConflicts', () => {
  const SECTION_SEPARATOR = '@';
  const TERRAFORMATION_LEVELS_SECTION_INDEX = 1;
  const PLAYERS_SECTION_INDEX = 2;
  const WORLD_OBJECTS_SECTION_INDEX = 3;
  const INVENTORIES_SECTION_INDEX = 4;

  const defaultPlayerConfiguration = {
    playerPosition: '0,0,0',
    playerRotation: '0,0,0,0',
    playerGaugeOxygen: 280.0,
    playerGaugeThirst: 96.0,
    playerGaugeHealth: 72.0,
    playerGaugeToxic: 0.0,
    host: true,
    planetId: 'Toxicity'
  };

  const defaultPlayerFromA = {...defaultPlayerConfiguration, id: 1, name: 'Nikowa', inventoryId: 10, equipmentId: 11, host: true};
  const defaultPlayerFromB = {...defaultPlayerConfiguration, id: 2, name: 'Chileny', inventoryId: 20, equipmentId: 21, host: false};

  const inventoryOfA = {id: 10, woIds: '', size: 10};
  const equipmentOfA = {id: 11, woIds: '', size: 10};
  const inventoryOfB = {id: 20, woIds: '', size: 10};
  const equipmentOfB = {id: 21, woIds: '', size: 10};

  describe('Rule: keep all inventories even if not used by a player', () => {
    it('should keep an inventory referenced by a world object liId', () => {
      // Arrange
      const worldObjectWithInventory = {id: 200, gId: 'Container', liId: 99, pos: '0,1,0', rot: '0,0,0,1', planet: 110910047};
      const worldObjectInventory = {id: 99, woIds: '', size: 50};
      const fakeMergedSave = createFakeSaveString({
        players: [defaultPlayerFromA],
        worldObjects: [worldObjectWithInventory],
        inventories: [inventoryOfA, equipmentOfA, worldObjectInventory]
      });

      // Act
      const result = resolveIdConflicts(fakeMergedSave);

      // Assert
      const inventories = parseResultSection(result, INVENTORIES_SECTION_INDEX);
      expect(inventories.length).toBe(3);
      const [playerInventoryResult, playerEquipmentResult, worldObjectInventoryResult] = inventories;
      expect(playerInventoryResult.id).toBe(10);
      expect(playerEquipmentResult.id).toBe(11);
      expect(worldObjectInventoryResult.id).toBe(99);
    });

    it('should keep world object inventories from both saves when there is no id conflict', () => {
      // Arrange
      const worldObjectA = {id: 200, gId: 'Container', liId: 99, pos: '0,1,0', rot: '0,0,0,1', planet: 110910047};
      const worldObjectB = {id: 201, gId: 'Container', liId: 100, pos: '0,2,0', rot: '0,0,0,1', planet: 110910047};
      const worldObjectInventoryA = {id: 99, woIds: '', size: 50};
      const worldObjectInventoryB = {id: 100, woIds: '', size: 60};
      const mergedSave = createFakeSaveString({
        players: [defaultPlayerFromA],
        worldObjects: [worldObjectA, worldObjectB],
        inventories: [inventoryOfA, equipmentOfA, worldObjectInventoryA, worldObjectInventoryB]
      });

      // Act
      const result = resolveIdConflicts(mergedSave);

      // Assert
      const inventories = parseResultSection(result, INVENTORIES_SECTION_INDEX);
      expect(inventories.length).toBe(4);
      const [playerInventoryResult, playerEquipmentResult, worldObjectInventoryAResult, worldObjectInventoryBResult] = inventories;
      expect(playerInventoryResult.id).toBe(10);
      expect(playerEquipmentResult.id).toBe(11);
      expect(worldObjectInventoryAResult.id).toBe(99);
      expect(worldObjectInventoryBResult.id).toBe(100);
    });

    it('should keep all inventories even when duplicate ids are resolved', () => {
      // Arrange
      const playerFromB = {...defaultPlayerFromB, inventoryId: 10, equipmentId: 21};
      const duplicateInventoryFromB = {id: 10, woIds: '', size: 20};
      const extraInventory = {id: 10, woIds: '', size: 99};
      const mergedSave = createFakeSaveString({
        players: [defaultPlayerFromA, playerFromB],
        inventories: [inventoryOfA, duplicateInventoryFromB, extraInventory, equipmentOfA, equipmentOfB]
      });

      // Act
      const result = resolveIdConflicts(mergedSave);

      // Assert
      const inventories = parseResultSection(result, INVENTORIES_SECTION_INDEX);
      const ids = inventories.map(inventory => inventory.id);
      expect(inventories.length).toBe(5);
      expect(new Set(ids).size).toBe(5);
      const [firstInventory, secondInventory, thirdInventory, firstEquipment, secondEquipment] = inventories;
      expect(firstInventory.size).toBe(10);
      expect(secondInventory.size).toBe(20);
      expect(thirdInventory.size).toBe(99);
      expect(firstEquipment.size).toBe(10);
      expect(secondEquipment.size).toBe(10);
    });
  });

  describe('When there are no id conflicts', () => {
    it('should return the save unchanged', () => {
      // Arrange
      const worldObject = {id: 100, gId: 'SomeObject', pos: '100,200,300', rot: '0,0,0,1', planet: 110910047};
      const mergedSave = createFakeSaveString({
        players: [defaultPlayerFromA],
        worldObjects: [worldObject],
        inventories: [{...inventoryOfA, woIds: '100'}, equipmentOfA]
      });

      // Act
      const result = resolveIdConflicts(mergedSave);

      // Assert
      const players = parseResultSection(result, PLAYERS_SECTION_INDEX);
      const worldObjects = parseResultSection(result, WORLD_OBJECTS_SECTION_INDEX);
      const inventories = parseResultSection(result, INVENTORIES_SECTION_INDEX);

      expect(players[0].id).toBe(1);
      expect(worldObjects[0].id).toBe(100);
      expect(inventories[0].id).toBe(10);
      expect(inventories[0].woIds).toBe('100');
    });
  });

  describe('Player id conflicts', () => {
    it('should assign a unique id to a player from save B when they share an id with a player from save A', () => {
      // Arrange
      const playerFromB = {...defaultPlayerFromB, id: 1};
      const mergedSave = createFakeSaveString({
        players: [defaultPlayerFromA, playerFromB],
        inventories: [inventoryOfA, equipmentOfA, inventoryOfB, equipmentOfB]
      });

      // Act
      const result = resolveIdConflicts(mergedSave);

      // Assert
      const players = parseResultSection(result, PLAYERS_SECTION_INDEX);
      expect(players[0].id).toBe(1);
      expect(players[1].id).not.toBe(1);
      expect(players[1].name).toBe('Chileny');
    });
  });

  describe('Inventory id conflicts', () => {
    it('should keep the player pointing to the correct inventory after a duplicate inventory id is resolved', () => {
      // Arrange
      const playerFromB = {...defaultPlayerFromB, inventoryId: 10, equipmentId: 21};
      const duplicateInventoryFromB = {id: 10, woIds: '', size: 20};
      const mergedSave = createFakeSaveString({
        players: [defaultPlayerFromA, playerFromB],
        inventories: [inventoryOfA, duplicateInventoryFromB, equipmentOfA, equipmentOfB]
      });

      // Act
      const result = resolveIdConflicts(mergedSave);

      // Assert
      const players = parseResultSection(result, PLAYERS_SECTION_INDEX);
      const inventories = parseResultSection(result, INVENTORIES_SECTION_INDEX);

      expect(players[0].inventoryId).toBe(10);
      expect(players[1].inventoryId).not.toBe(10);
      expect(inventories.find(inventory => inventory.size === 20).id).toBe(players[1].inventoryId);
    });

    it('should assign independent unique ids when both inventoryId and equipmentId of a player are duplicated', () => {
      // Arrange
      const playerFromB = {...defaultPlayerFromB, inventoryId: 10, equipmentId: 10};
      const inventoryFromBForInventorySlot = {id: 10, woIds: '', size: 20};
      const inventoryFromBForEquipmentSlot = {id: 10, woIds: '', size: 5};
      const mergedSave = createFakeSaveString({
        players: [defaultPlayerFromA, playerFromB],
        inventories: [inventoryOfA, inventoryFromBForInventorySlot, inventoryFromBForEquipmentSlot, equipmentOfA]
      });

      // Act
      const result = resolveIdConflicts(mergedSave);

      // Assert
      const players = parseResultSection(result, PLAYERS_SECTION_INDEX);
      const inventories = parseResultSection(result, INVENTORIES_SECTION_INDEX);
      const ids = inventories.map(inventory => inventory.id);
      const uniqueIds = new Set(ids);

      expect(uniqueIds.size).toBe(ids.length);
      expect(players[0].inventoryId).toBe(10);
      expect(players[1].inventoryId).not.toBe(10);
      expect(players[1].equipmentId).not.toBe(10);
      expect(players[1].inventoryId).not.toBe(players[1].equipmentId);
    });

    it('should keep the player pointing to the correct equipment after a duplicate equipment id is resolved', () => {
      // Arrange
      const playerFromB = {...defaultPlayerFromB, inventoryId: 20, equipmentId: 11};
      const duplicateEquipmentFromB = {id: 11, woIds: '', size: 20};
      const mergedSave = createFakeSaveString({
        players: [defaultPlayerFromA, playerFromB],
        inventories: [inventoryOfA, equipmentOfA, inventoryOfB, duplicateEquipmentFromB]
      });

      // Act
      const result = resolveIdConflicts(mergedSave);

      // Assert
      const players = parseResultSection(result, PLAYERS_SECTION_INDEX);
      const inventories = parseResultSection(result, INVENTORIES_SECTION_INDEX);

      expect(players[0].equipmentId).toBe(11);
      expect(players[1].equipmentId).not.toBe(11);
      expect(inventories.find(inventory => inventory.size === 20).id).toBe(players[1].equipmentId);
    });
  });

  describe('World object to inventory links', () => {
    it('should preserve the link between a world object and its inventory when there is no conflict', () => {
      // Arrange
      const worldObject = {id: 100, gId: 'Container1', liId: 10, pos: '0,0,0', rot: '0,0,0,1', planet: 110910047};
      const mergedSave = createFakeSaveString({
        players: [defaultPlayerFromA],
        worldObjects: [worldObject],
        inventories: [inventoryOfA, equipmentOfA]
      });

      // Act
      const result = resolveIdConflicts(mergedSave);

      // Assert
      const worldObjects = parseResultSection(result, WORLD_OBJECTS_SECTION_INDEX);
      expect(worldObjects[0].liId).toBe(10);
    });

    it('should update each world object to point to its correct inventory when duplicate inventory ids are resolved', () => {
      // Arrange
      const playerFromB = {...defaultPlayerFromB, inventoryId: 10, equipmentId: 21};
      const duplicateInventoryFromB = {id: 10, woIds: '', size: 20};
      const worldObjectA = {id: 100, gId: 'Container1', liId: 10, pos: '0,0,0', rot: '0,0,0,1', planet: 110910047};
      const worldObjectB = {id: 101, gId: 'Container1', liId: 10, pos: '1,0,0', rot: '0,0,0,1', planet: 110910047};
      const mergedSave = createFakeSaveString({
        players: [defaultPlayerFromA, playerFromB],
        worldObjects: [worldObjectA, worldObjectB],
        inventories: [inventoryOfA, duplicateInventoryFromB, equipmentOfA, equipmentOfB]
      });

      // Act
      const result = resolveIdConflicts(mergedSave);

      // Assert
      const players = parseResultSection(result, PLAYERS_SECTION_INDEX);
      const worldObjects = parseResultSection(result, WORLD_OBJECTS_SECTION_INDEX);
      const newInventoryId = players[1].inventoryId;

      expect(worldObjects[0].liId).toBe(10);
      expect(worldObjects[1].liId).toBe(newInventoryId);
    });
  });

  describe('World object sub-inventory links', () => {
    it('should preserve sub-inventory references when there is no inventory id conflict', () => {
      // Arrange
      const subInventoryA = {id: 50, woIds: '', size: 1};
      const subInventoryB = {id: 51, woIds: '', size: 1};
      const farmWorldObject = {id: 100, gId: 'Farm1', siIds: '50,51', pos: '0,0,0', rot: '0,0,0,1', planet: 110910047};
      const mergedSave = createFakeSaveString({
        players: [defaultPlayerFromA],
        worldObjects: [farmWorldObject],
        inventories: [inventoryOfA, equipmentOfA, subInventoryA, subInventoryB]
      });

      // Act
      const result = resolveIdConflicts(mergedSave);

      // Assert
      const worldObjects = parseResultSection(result, WORLD_OBJECTS_SECTION_INDEX);
      expect(worldObjects[0].siIds).toBe('50,51');
    });

    it('should update sub-inventory references when duplicate inventory ids are resolved', () => {
      // Arrange
      const playerFromB = {...defaultPlayerFromB, inventoryId: 10, equipmentId: 21};
      const duplicateInventoryFromB = {id: 10, woIds: '', size: 20};
      const subInventoryWithConflict = {id: 10, woIds: '', size: 1};
      const farmWorldObject = {id: 100, gId: 'Farm1', siIds: '10', pos: '0,0,0', rot: '0,0,0,1', planet: 110910047};
      const mergedSave = createFakeSaveString({
        players: [defaultPlayerFromA, playerFromB],
        worldObjects: [farmWorldObject],
        inventories: [inventoryOfA, duplicateInventoryFromB, subInventoryWithConflict, equipmentOfA, equipmentOfB]
      });

      // Act
      const result = resolveIdConflicts(mergedSave);

      // Assert
      const worldObjects = parseResultSection(result, WORLD_OBJECTS_SECTION_INDEX);
      const inventories = parseResultSection(result, INVENTORIES_SECTION_INDEX);
      const subInventory = inventories.find(inventory => inventory.size === 1);
      expect(worldObjects[0].siIds).toBe(String(subInventory.id));
    });

    it('should update multiple sub-inventory references when inventory ids are remapped', () => {
      // Arrange
      const playerFromB = {...defaultPlayerFromB, inventoryId: 10, equipmentId: 21};
      const duplicateInventoryFromB = {id: 10, woIds: '', size: 20};
      const subInventoryWithConflictA = {id: 10, woIds: '', size: 1};
      const subInventoryWithConflictB = {id: 10, woIds: '', size: 2};
      const farmWorldObject = {id: 100, gId: 'Farm1', siIds: '10,10', pos: '0,0,0', rot: '0,0,0,1', planet: 110910047};
      const mergedSave = createFakeSaveString({
        players: [defaultPlayerFromA, playerFromB],
        worldObjects: [farmWorldObject],
        inventories: [inventoryOfA, duplicateInventoryFromB, subInventoryWithConflictA, subInventoryWithConflictB, equipmentOfA, equipmentOfB]
      });

      // Act
      const result = resolveIdConflicts(mergedSave);

      // Assert
      const worldObjects = parseResultSection(result, WORLD_OBJECTS_SECTION_INDEX);
      const siIdValues = worldObjects[0].siIds.split(',').map(Number);
      const inventories = parseResultSection(result, INVENTORIES_SECTION_INDEX);
      const subInventoryA = inventories.find(inventory => inventory.size === 1);
      const subInventoryB = inventories.find(inventory => inventory.size === 2);
      expect(siIdValues).toContain(subInventoryA.id);
      expect(siIdValues).toContain(subInventoryB.id);
    });
  });

  describe('World object linked world object references', () => {
    it('should preserve linkedWo reference when there is no world object id conflict', () => {
      // Arrange
      const lake = {id: 200, gId: 'Lake1', pos: '5,0,5', rot: '0,0,0,1', planet: 110910047};
      const generator = {id: 201, gId: 'WaterGenerator', linkedWo: 200, pos: '5,1,5', rot: '0,0,0,1', planet: 110910047};
      const mergedSave = createFakeSaveString({
        players: [defaultPlayerFromA],
        worldObjects: [lake, generator],
        inventories: [inventoryOfA, equipmentOfA]
      });

      // Act
      const result = resolveIdConflicts(mergedSave);

      // Assert
      const worldObjects = parseResultSection(result, WORLD_OBJECTS_SECTION_INDEX);
      const generatorResult = worldObjects.find(wo => wo.gId === 'WaterGenerator');
      expect(generatorResult.linkedWo).toBe(200);
    });

    it('should update linkedWo reference when the linked world object id is remapped', () => {
      // Arrange
      const lakeFromA = {id: 100, gId: 'Lake1', pos: '5,0,5', rot: '0,0,0,1', planet: 110910047};
      const lakeFromB = {id: 100, gId: 'Lake2', pos: '10,0,10', rot: '0,0,0,1', planet: 110910047};
      const generatorFromB = {id: 201, gId: 'WaterGenerator', linkedWo: 100, pos: '10,1,10', rot: '0,0,0,1', planet: 110910047};
      const mergedSave = createFakeSaveString({
        players: [defaultPlayerFromA],
        worldObjects: [lakeFromA, lakeFromB, generatorFromB],
        inventories: [inventoryOfA, equipmentOfA]
      });

      // Act
      const result = resolveIdConflicts(mergedSave);

      // Assert
      const worldObjects = parseResultSection(result, WORLD_OBJECTS_SECTION_INDEX);
      const lakeB = worldObjects.find(wo => wo.gId === 'Lake2');
      const generatorB = worldObjects.find(wo => wo.gId === 'WaterGenerator');
      expect(generatorB.linkedWo).toBe(lakeB.id);
    });
  });

  describe('World object id conflicts', () => {
    it('should assign a unique id to a world object from save B when it shares an id with a world object from save A', () => {
      // Arrange
      const worldObjectFromA = {id: 100, gId: 'SomeObject', pos: '100,200,300', rot: '0,0,0,1', planet: 110910047};
      const worldObjectFromB = {id: 100, gId: 'OtherObject', pos: '400,500,600', rot: '0,0,0,1', planet: 110910047};
      const mergedSave = createFakeSaveString({worldObjects: [worldObjectFromA, worldObjectFromB]});

      // Act
      const result = resolveIdConflicts(mergedSave);

      // Assert
      const worldObjects = parseResultSection(result, WORLD_OBJECTS_SECTION_INDEX);
      expect(worldObjects[0].id).toBe(100);
      expect(worldObjects[1].id).not.toBe(100);
    });

    it('should generate a new world object id that does not collide with any existing world object id', () => {
      // Arrange
      const worldObjectFromA = {id: 500, gId: 'SomeObject', pos: '100,200,300', rot: '0,0,0,1', planet: 110910047};
      const worldObjectFromB = {id: 500, gId: 'OtherObject', pos: '400,500,600', rot: '0,0,0,1', planet: 110910047};
      const mergedSave = createFakeSaveString({
        players: [defaultPlayerFromA],
        worldObjects: [worldObjectFromA, worldObjectFromB],
        inventories: [inventoryOfA, equipmentOfA]
      });

      // Act
      const result = resolveIdConflicts(mergedSave);

      // Assert
      const worldObjects = parseResultSection(result, WORLD_OBJECTS_SECTION_INDEX);
      expect(worldObjects[1].id > 500).toBeTruthy();
    });

    it('should update inventory item references when a world object receives a new id', () => {
      // Arrange
      const worldObjectFromA = {id: 100, gId: 'SomeObject', pos: '100,200,300', rot: '0,0,0,1', planet: 110910047};
      const worldObjectFromB = {id: 100, gId: 'OtherObject', pos: '400,500,600', rot: '0,0,0,1', planet: 110910047};
      const mergedSave = createFakeSaveString({
        players: [defaultPlayerFromA],
        worldObjects: [worldObjectFromA, worldObjectFromB],
        inventories: [{...inventoryOfA, woIds: '100'}, equipmentOfA]
      });

      // Act
      const result = resolveIdConflicts(mergedSave);

      // Assert
      const worldObjects = parseResultSection(result, WORLD_OBJECTS_SECTION_INDEX);
      const inventories = parseResultSection(result, INVENTORIES_SECTION_INDEX);
      const newId = worldObjects[1].id;
      const inventory = inventories.find(inventory => inventory.id === 10);

      expect(inventory.woIds.split(',').includes(String(newId))).toBeTruthy();
    });
  });

  describe('Output format', () => {
    it('should preserve player gauge float values after conflict resolution', () => {
      // Arrange
      const mergedSave = createFakeSaveString({
        players: [defaultPlayerFromA],
        inventories: [inventoryOfA, equipmentOfA]
      });

      // Act
      const result = resolveIdConflicts(mergedSave);

      // Assert
      const playersSection = result.split(SECTION_SEPARATOR)[PLAYERS_SECTION_INDEX];
      expect(playersSection.includes('"playerGaugeOxygen":280.0')).toBeTruthy();
      expect(playersSection.includes('"playerGaugeToxic":0.0')).toBeTruthy();
    });

    it('should preserve terraformation level float values after conflict resolution', () => {
      // Arrange
      const level = {
        planetId: 'Toxicity',
        unitOxygenLevel: 2477136019456.0,
        unitHeatLevel: 2219597103104.0,
        unitPressureLevel: 2262299836416.0,
        unitPlantsLevel: 918480420864.0,
        unitInsectsLevel: 372341538816.0,
        unitAnimalsLevel: 10118330580992.0,
        unitPurificationLevel: 2653680304128.0
      };
      const mergedSave = createFakeSaveString({terraformationLevels: [level]});

      // Act
      const result = resolveIdConflicts(mergedSave);

      // Assert
      const terraSection = result.split(SECTION_SEPARATOR)[TERRAFORMATION_LEVELS_SECTION_INDEX];
      expect(terraSection.includes('"unitOxygenLevel":2477136019456.0')).toBeTruthy();
    });

    it('should produce a valid save string after conflict resolution', () => {
      // Arrange
      const mergedSave = createFakeSaveString({});

      // Act
      const result = resolveIdConflicts(mergedSave);

      // Assert
      const sections = parseSaveSections(result);
      expect(sections.length).toBe(12);
    });

    it('should preserve all sections in the correct order', () => {
      // Arrange
      const worldObject = {id: 100, gId: 'SomeObject', pos: '100,200,300', rot: '0,0,0,1', planet: 110910047};
      const mergedSave = createFakeSaveString({
        players: [defaultPlayerFromA],
        worldObjects: [worldObject],
        inventories: [inventoryOfA, equipmentOfA],
        statistics: {craftedObjects: 10, totalSaveFileLoad: 1, totalSaveFileTime: 100},
        terrainLayers: [{layerId: 'PC-Toxicity-Layer1', planet: 110910047, colorBase: '1-1-1-1'}]
      });

      // Act
      const result = resolveIdConflicts(mergedSave);

      // Assert
      const [, , players, worldObjectsGenerator, inventories, statistics] = parseSaveSections(result);
      expect(players[0].name).toBe('Nikowa');
      expect([...worldObjectsGenerator][0].id).toBe(100);
      expect(inventories[0].id).toBe(10);
      expect(statistics[0].craftedObjects).toBe(10);
    });
  });

  const sectionSeparator = /\|\r?\n/;
  const parseResultSection = (result, index) => {
    const sections = result.split(SECTION_SEPARATOR);

    return sections[index].trim().split(sectionSeparator)
      .map(lineString => lineString.trim())
      .filter(Boolean)
      .map(lineString => JSON.parse(lineString));
  }
});

