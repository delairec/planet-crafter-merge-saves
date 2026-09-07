import {describe, expect, it} from 'bun:test';
import {computeEnergyConsumptionLevel} from './computeEnergyConsumptionLevel';
import {PlacedWorldObjectEntity} from '../entities/PlacedWorldObjectEntity';
import {WORLD_OBJECT_NAMES, WorldObjectName} from '../worldObjectNames';
import {energyConsumptionLevelsByWorldObjectName} from '../energyLevelsByWorldObjectName';

describe('computeEnergyConsumptionLevel', () => {
  it('should sum the consumption of positioned world objects with known consumption levels', () => {
    // Arrange
    const worldObjects: PlacedWorldObjectEntity[] = [
      {id: '1', name: 'Drill0' as WorldObjectName, position: [0, 0, 0], planetId: 1},
      {id: '2', name: 'Heater1' as WorldObjectName, position: [1, 0, 0], planetId: 1}
    ];

    // Act
    const result = computeEnergyConsumptionLevel(worldObjects);

    // Assert
    expect(result).toBe(1.5);
  });

  it('should ignore world objects with no known consumption level', () => {
    // Arrange
    const worldObjects: PlacedWorldObjectEntity[] = [
      {id: '1', name: 'Drill0' as WorldObjectName, position: [0, 0, 0], planetId: 1},
      {id: '2', name: 'EnergyGenerator1' as WorldObjectName, position: [1, 0, 0], planetId: 1}
    ];

    // Act
    const result = computeEnergyConsumptionLevel(worldObjects);

    // Assert
    expect(result).toBe(0.5);
  });

  // Rule EN-BASE-2 (exhaustiveness) is a claim about the game, not about this code, and no unit
  // test can put it in default: the repository holds no inventory of the game's power-drawing
  // machines that is independent of the table under test (see docs/energy-levels.md). Deriving the
  // input set from `Object.keys(energyConsumptionLevelsByWorldObjectName)`, as this file used to,
  // makes a missing machine structurally undetectable — dropping an entry silently drops a case.
  //
  // What this guard covers instead is the regression that actually happens: a new tier of an
  // already-consuming machine family reaching `WORLD_OBJECT_NAMES` without an energy level — a
  // `Drill5`, a `Heater6`, an `OreBreaker4`. Its input set comes from `worldObjectNames.ts`, so
  // removing a table entry whose family keeps another member turns it red instead of green.
  //
  // Two known limits, both deliberate: a family is recognized by stripping the trailing tier
  // digits off the name, which is a convention and not a declaration; and a family reduced to a
  // single member (`Beacon`, `ComAntenna`) disappears with its own entry, so removing it stays
  // green. Closing the second one means declaring an explicit no-energy partition over all 701
  // names, which would freeze unverifiable claims into a green test.
  const extractMachineFamily = (worldObjectName: string): string => worldObjectName.replace(/\d+(T\d+)?$/, '');

  // Not omissions: the game's own English label file for version 2.102 carries a `GROUP_NAME_`
  // entry for every plain tier (`AirPurificationMachine1`..`4`, `AlgaeGenerator1`..`2`) and none
  // for any `*T*` spelling, so these six identifiers name no buildable machine. The wiki
  // corroborates it — https://planet-crafter.fandom.com/wiki/Atmosphere_Purifiers lists four
  // purifier tiers and https://planet-crafter.fandom.com/wiki/Algae_Generators two algae
  // generator tiers, with no further tier — and none of them occurs in any reference save.
  const namesOfNoBuildableMachine: readonly WorldObjectName[] = [
    'AirPurificationMachine1T1',
    'AirPurificationMachine2T2',
    'AirPurificationMachine3T3',
    'AirPurificationMachine4T4',
    'AlgaeGenerator1T1',
    'AlgaeGenerator2T2'
  ];

  const consumingMachineFamilies = new Set(
    Object.keys(energyConsumptionLevelsByWorldObjectName).map(extractMachineFamily)
  );
  const namesOfConsumingMachineFamilies = WORLD_OBJECT_NAMES.filter(
    (name) => consumingMachineFamilies.has(extractMachineFamily(name)) && !namesOfNoBuildableMachine.includes(name)
  );

  it.each(namesOfConsumingMachineFamilies)('should charge %s, its machine family drawing power', (name) => {
    // Arrange
    const consumer: PlacedWorldObjectEntity = {id: name, name, position: [0, 0, 0], planetId: 1};

    // Act
    const consumptionLevel = computeEnergyConsumptionLevel([consumer]);

    // Assert
    expect(consumptionLevel).toBeGreaterThan(0);
  });

  it('should return zero for an empty list of world objects', () => {
    // Arrange
    const worldObjects: PlacedWorldObjectEntity[] = [];

    // Act
    const result = computeEnergyConsumptionLevel(worldObjects);

    // Assert
    expect(result).toBe(0);
  });
});
