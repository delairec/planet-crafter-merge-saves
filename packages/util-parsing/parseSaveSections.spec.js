import {describe, it, expect} from 'bun:test';
import {parseSaveSections} from './parseSaveSections.js';
import {createFakeSaveString} from '../util-testing/fixtures/createFakeSaveString.js';

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
    planetId: 'Toxicity'
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

  it('should parse a valid save into 12 sections', () => {
    // Arrange
    const save = createFakeSaveString({});

    // Act
    const {sections} = parseSaveSections(save);

    // Assert
    expect(sections.length).toBe(12);
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
    const [, , players] = sections;
    expect(players).toEqual([expectedPlayer]);
  });

  it('should parse world objects', () => {
    // Arrange
    const save = createFakeSaveString({worldObjects: [expectedWorldObject]});

    // Act
    const {sections} = parseSaveSections(save);

    // Assert
    const [, , , worldObjectsFactory] = sections;
    expect([...worldObjectsFactory()]).toEqual([expectedWorldObject]);
  });

  it('should parse inventories', () => {
    // Arrange
    const save = createFakeSaveString({inventories: [expectedInventory]});

    // Act
    const {sections} = parseSaveSections(save);

    // Assert
    const [, , , , inventories] = sections;
    expect(inventories).toEqual([expectedInventory]);
  });

  it('should parse an empty inventories section as empty', () => {
    // Arrange
    const save = createFakeSaveString({inventories: []});

    // Act
    const {sections} = parseSaveSections(save);

    // Assert
    const [, , , , inventories] = sections;
    expect(inventories).toEqual([]);
  });

  it('should parse an empty world objects section as empty', () => {
    // Arrange
    const save = createFakeSaveString({worldObjects: []});

    // Act
    const {sections} = parseSaveSections(save);

    // Assert
    const [, , , worldObjectsFactory] = sections;
    expect([...worldObjectsFactory()]).toEqual([]);
  });
});

