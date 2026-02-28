import {describe, it} from 'node:test';
import {deepEqual, equal, ok} from 'node:assert/strict';
import {parseSaveSections} from './parseSaveSections.js';
import {createFakeSaveString} from '../testing/createFakeSaveString.js';

describe('parseSaveSections', () => {
  const player = {id: 1, name: 'Rrose', inventoryId: 44, equipmentId: 45, playerPosition: '0,0,0', playerRotation: '0,0,0,0', playerGaugeOxygen: 280.0, playerGaugeThirst: 96.0, playerGaugeHealth: 72.0, playerGaugeToxic: 0.0, host: true, planetId: 'Toxicity'};
  const worldObject = {id: 101, gId: 'SomeObject', pos: '100,200,300', rot: '0,0,0,1', planet: 110910047};
  const inventory = {id: 44, woIds: '101,102', size: 10};
  const terraformationLevel = {planetId: 'Toxicity', unitOxygenLevel: 100.0, unitHeatLevel: 200.0, unitPressureLevel: 300.0, unitPlantsLevel: 400.0, unitInsectsLevel: 500.0, unitAnimalsLevel: 600.0, unitPurificationLevel: 700.0};

  it('should return 12 elements (11 sections + 1 trailing empty from split)', () => {
    // Arrange
    const save = createFakeSaveString({});

    // Act
    const sections = parseSaveSections(save);

    // Assert
    equal(sections.length, 12);
  });

  it('should parse global metadata as an array at index 0', () => {
    // Arrange
    const globalMetadata = {terraTokens: 100, allTimeTerraTokens: 200, unlockedGroups: 'GroupA', openedInstanceSeed: 0, openedInstanceTimeLeft: 0};
    const save = createFakeSaveString({globalMetadata});

    // Act
    const [metadata] = parseSaveSections(save);

    // Assert
    deepEqual(metadata, [globalMetadata]);
  });

  it('should parse terraformation levels as an array at index 1', () => {
    // Arrange
    const save = createFakeSaveString({terraformationLevels: [terraformationLevel]});

    // Act
    const [, terraformationLevels] = parseSaveSections(save);

    // Assert
    deepEqual(terraformationLevels, [terraformationLevel]);
  });

  it('should parse players as an array at index 2', () => {
    // Arrange
    const save = createFakeSaveString({players: [player]});

    // Act
    const [,, players] = parseSaveSections(save);

    // Assert
    deepEqual(players, [player]);
  });

  it('should return a generator for world objects at index 3', () => {
    // Arrange
    const save = createFakeSaveString({worldObjects: [worldObject]});

    // Act
    const [,,, worldObjectsGenerator] = parseSaveSections(save);

    // Assert
    ok(typeof worldObjectsGenerator[Symbol.iterator] === 'function', 'should be iterable');
    deepEqual([...worldObjectsGenerator], [worldObject]);
  });

  it('should parse inventories as an array at index 4', () => {
    // Arrange
    const save = createFakeSaveString({inventories: [inventory]});

    // Act
    const [,,,, inventories] = parseSaveSections(save);

    // Assert
    deepEqual(inventories, [inventory]);
  });

  it('should return an empty array for an empty section', () => {
    // Arrange
    const save = createFakeSaveString({inventories: []});

    // Act
    const [,,,, inventories] = parseSaveSections(save);

    // Assert
    deepEqual(inventories, []);
  });

  it('should return an empty generator for an empty world objects section', () => {
    // Arrange
    const save = createFakeSaveString({worldObjects: []});

    // Act
    const [,,, worldObjectsGenerator] = parseSaveSections(save);

    // Assert
    deepEqual([...worldObjectsGenerator], []);
  });
});

