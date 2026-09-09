import {describe, it, expect, spyOn} from 'bun:test';
import {parseSaveSections} from './parseSaveSections.js';
import {createFakeSaveString, createLegacyFakeSaveString} from './testing/createFakeSaveString.js';
import {
  INVENTORIES_SECTION_INDEX,
  PLAYERS_SECTION_INDEX,
  RESERVED_TRAILING_SECTION_INDEX,
  WORLD_EVENTS_SECTION_INDEX,
  WORLD_OBJECTS_SECTION_INDEX
} from './sectionIndexes.js';

describe('utils/parseSaveSections', () => {
  const expectedGlobalMetadata = {
    terraTokens: 100,
    allTimeTerraTokens: 200,
    unlockedGroups: 'GroupA',
    openedInstanceSeed: 0,
    openedInstanceTimeLeft: 0
  };
  const expectedPlayer = {
    id: 1,
    name: 'Nikowa',
    inventoryId: 44,
    equipmentId: 45,
    playerPosition: '0,0,0',
    playerRotation: '0,0,0,0',
    playerGaugeOxygen: 280.0,
    playerGaugeThirst: 96.0,
    playerGaugeHealth: 72.0,
    playerGaugeToxic: 0.0,
    host: true,
    planetId: 'Toxicity',
    cameraView: 0,
    totalCraftedObjects: 0,
    totalTerraTokenEarned: 0
  };
  const expectedWorldObject = {id: 101, gId: 'SomeObject', pos: '100,200,300', rot: '0,0,0,1', planet: 110910047};
  const expectedInventory = {id: 44, woIds: '101,102', size: 10};
  const expectedTerraformationLevel = {
    planetId: 'Toxicity',
    unitOxygenLevel: 100.0,
    unitHeatLevel: 200.0,
    unitPressureLevel: 300.0,
    unitPlantsLevel: 400.0,
    unitInsectsLevel: 500.0,
    unitAnimalsLevel: 600.0,
    unitPurificationLevel: 700.0
  };

  it('should parse a valid save into 11 sections', () => {
    // Arrange
    const save = createFakeSaveString({});

    // Act
    const {sections} = parseSaveSections(save);

    // Assert
    expect(sections.length).toBe(11);
  });

  it('should parse a valid save with no warnings', () => {
    // Arrange
    const save = createFakeSaveString({});

    // Act
    const {warnings} = parseSaveSections(save);

    // Assert
    expect(warnings).toEqual([]);
  });

  it('should parse global metadata', () => {
    // Arrange
    const save = createFakeSaveString({globalMetadata: expectedGlobalMetadata});

    // Act
    const {sections} = parseSaveSections(save);

    // Assert
    const [metadata] = sections;
    expect(metadata).toEqual([expectedGlobalMetadata]);
  });

  it('should parse terraformation levels', () => {
    // Arrange
    const save = createFakeSaveString({terraformationLevels: [expectedTerraformationLevel]});

    // Act
    const {sections} = parseSaveSections(save);

    // Assert
    const [, terraformationLevels] = sections;
    expect(terraformationLevels).toEqual([expectedTerraformationLevel]);
  });

  it('should parse players', () => {
    // Arrange
    const save = createFakeSaveString({players: [expectedPlayer]});

    // Act
    const {sections} = parseSaveSections(save);

    // Assert
    const players = sections[PLAYERS_SECTION_INDEX];
    expect(players).toEqual([expectedPlayer]);
  });

  it('should parse world objects', () => {
    // Arrange
    const save = createFakeSaveString({worldObjects: [expectedWorldObject]});

    // Act
    const {sections} = parseSaveSections(save);

    // Assert
    const worldObjectsFactory = sections[WORLD_OBJECTS_SECTION_INDEX];
    expect([...worldObjectsFactory()]).toEqual([expectedWorldObject]);
  });

  it('should parse inventories', () => {
    // Arrange
    const save = createFakeSaveString({inventories: [expectedInventory]});

    // Act
    const {sections} = parseSaveSections(save);

    // Assert
    const inventories = sections[INVENTORIES_SECTION_INDEX];
    expect(inventories).toEqual([expectedInventory]);
  });

  it('should parse an empty inventories section as empty', () => {
    // Arrange
    const save = createFakeSaveString({inventories: []});

    // Act
    const {sections} = parseSaveSections(save);

    // Assert
    const inventories = sections[INVENTORIES_SECTION_INDEX];
    expect(inventories).toEqual([]);
  });

  describe('When a world object line cannot be read', () => {
    it('should record the failure with its section, its position and an excerpt of the line, instead of logging to the console', () => {
      // Arrange
      const save = createFakeSaveString({worldObjects: [expectedWorldObject]})
        .replace(JSON.stringify(expectedWorldObject), '{not valid json');
      const consoleLogSpy = spyOn(console, 'log');

      // Act
      const {sections, errors} = parseSaveSections(save);
      const worldObjectsFactory = sections[WORLD_OBJECTS_SECTION_INDEX];
      [...worldObjectsFactory()];

      // Assert
      expect(errors).toEqual([
        {detail: 'Invalid JSON: {not valid json', section: WORLD_OBJECTS_SECTION_INDEX, entryIndex: 0}
      ]);
      expect(consoleLogSpy).not.toHaveBeenCalled();
    });
  });

  it('should parse an empty world objects section as empty', () => {
    // Arrange
    const save = createFakeSaveString({worldObjects: []});

    // Act
    const {sections} = parseSaveSections(save);

    // Assert
    const worldObjectsFactory = sections[WORLD_OBJECTS_SECTION_INDEX];
    expect([...worldObjectsFactory()]).toEqual([]);
  });

  it('should parse world events at their current index', () => {
    // Arrange
    const expectedWorldEvent = {planet: 110910045, seed: 1, pos: '0,0,0', owner: 0, index: 0};
    const save = createFakeSaveString({worldEvents: [expectedWorldEvent]});

    // Act
    const {sections} = parseSaveSections(save);

    // Assert
    const worldEvents = sections[WORLD_EVENTS_SECTION_INDEX];
    expect(worldEvents).toEqual([expectedWorldEvent]);
  });

  describe('When the save does not split into the expected number of parts', () => {
    it('should report the expected and the actual count', () => {
      // Arrange
      const saveOfTwoReadableParts = '{}@{}';

      // Act
      const {errors} = parseSaveSections(saveOfTwoReadableParts);

      // Assert
      expect(errors).toEqual([{detail: 'Expected 11 sections but found 2'}]);
    });
  });

  describe('When a line of a section cannot be read', () => {
    it('should report the failure with its section, its position and an excerpt of the line', () => {
      // Arrange
      const unreadableInventory = {id: 45, woIds: '', size: 20};
      const save = createFakeSaveString({inventories: [expectedInventory, unreadableInventory]})
        .replace(JSON.stringify(unreadableInventory), '{not valid json');

      // Act
      const {errors} = parseSaveSections(save);

      // Assert
      expect(errors).toEqual([
        {detail: 'Invalid JSON: {not valid json', section: INVENTORIES_SECTION_INDEX, entryIndex: 1}
      ]);
    });

    it('should keep the readable entries surrounding it', () => {
      // Arrange
      const unreadableInventory = {id: 45, woIds: '', size: 20};
      const save = createFakeSaveString({inventories: [expectedInventory, unreadableInventory]})
        .replace(JSON.stringify(unreadableInventory), '{not valid json');

      // Act
      const {sections} = parseSaveSections(save);

      // Assert
      const inventories = sections[INVENTORIES_SECTION_INDEX];
      expect(inventories).toEqual([expectedInventory]);
    });
  });

  describe('When the save holds blank sections', () => {
    it('should report no error for them nor for the reserved trailing part', () => {
      // Arrange
      const saveWithoutMailboxesStoryEventsAndWorldEvents = createFakeSaveString({});

      // Act
      const {errors} = parseSaveSections(saveWithoutMailboxesStoryEventsAndWorldEvents);

      // Assert
      expect(errors).toEqual([]);
    });

    it('should read the reserved trailing part as an empty section', () => {
      // Arrange
      const save = createFakeSaveString({});

      // Act
      const {sections} = parseSaveSections(save);

      // Assert
      const reservedTrailingSection = sections[RESERVED_TRAILING_SECTION_INDEX];
      expect(reservedTrailingSection).toEqual([]);
    });
  });

  describe('When the save uses the legacy format (still contains a Terrain Layers section removed by a game update)', () => {
    it('should adapt it to the current 11-section format', () => {
      // Arrange
      const save = createLegacyFakeSaveString({
        terrainLayers: [{layerId: 'PC-Toxicity-Layer1', planet: 110910047, colorBase: '1-1-1-1'}]
      });

      // Act
      const {errors, sections} = parseSaveSections(save);

      // Assert
      expect(errors).toEqual([]);
      expect(sections.length).toBe(11);
    });

    it('should report a legacy-save-format warning code', () => {
      // Arrange
      const save = createLegacyFakeSaveString({
        terrainLayers: [{layerId: 'PC-Toxicity-Layer1', planet: 110910047, colorBase: '1-1-1-1'}]
      });

      // Act
      const {warnings} = parseSaveSections(save);

      // Assert
      expect(warnings).toEqual(['legacy-save-format']);
    });

    it('should still parse world events at the current index (shifted from the legacy index)', () => {
      // Arrange
      const expectedWorldEvent = {planet: 110910045, seed: 1, pos: '0,0,0', owner: 0, index: 0};
      const save = createLegacyFakeSaveString({worldEvents: [expectedWorldEvent]});

      // Act
      const {sections} = parseSaveSections(save);

      // Assert
      const worldEvents = sections[WORLD_EVENTS_SECTION_INDEX];
      expect(worldEvents).toEqual([expectedWorldEvent]);
    });
  });
});

