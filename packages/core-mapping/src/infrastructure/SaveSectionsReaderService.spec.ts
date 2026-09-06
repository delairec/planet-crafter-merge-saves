import {describe, expect, it} from 'bun:test';
import {createFakeParsedSave} from 'shared-save-processing/testing/createFakeParsedSave.js';
import {
  createEquipment,
  createGlobalMetadata,
  createInventory,
  createPlayer,
  createSaveConfiguration,
  createStatistics,
  createTerraformationLevel
} from 'shared-save-processing/testing/createSaveRecords.js';
import {ParsedSections, WorldObject} from 'shared-save-processing/gameDefinitions';
import {SaveSectionsReaderService} from './SaveSectionsReaderService';
import {PlayerEntity} from '../domain/entities/PlayerEntity';
import {GlobalProgressionValueObject} from '../domain/valueObjects/GlobalProgressionValueObject';
import {TerraformationLevelEntity} from '../domain/entities/TerraformationLevelEntity';
import {StatisticsValueObject} from '../domain/valueObjects/StatisticsValueObject';
import {SaveConfigurationValueObject} from '../domain/valueObjects/SaveConfigurationValueObject';
import {EnergyLevelsRawDataValueObject} from '../domain/valueObjects/EnergyLevelsRawDataValueObject';

const PRIME_PLANET_NUMERIC_ID = -1140328421;
const UNKNOWN_PLANET_NUMERIC_ID = 1;

const CARRIED_WORLD_OBJECTS: WorldObject[] = [
  {id: 79111656, gId: 'Phytoplankton3'},
  {id: 58524136, gId: 'MagnetarQuartz'},
  {id: 85274195, gId: 'Backpack4'},
  {id: 48456321, gId: 'OxygenTank5'},
  {id: 15974863, gId: 'Phytoplankton1'},
  {id: 28491667, gId: 'PulsarQuartz'},
  {id: 39187611, gId: 'Backpack7'},
  {id: 65514812, gId: 'OxygenTank4'}
] as WorldObject[];

function worldObjectsOf(worldObjects: WorldObject[]): () => Generator<WorldObject> {
  return function* worldObjectsGenerator() {
    yield* worldObjects;
  };
}

function createSectionsWithTwoPlayers(): ParsedSections {
  return createFakeParsedSave({
    globalMetadata: [createGlobalMetadata()],
    terraformationLevels: [createTerraformationLevel()],
    players: [
      createPlayer({name: 'Nikowa'}),
      createPlayer({name: 'Chileny', inventoryId: 46, equipmentId: 47})
    ],
    worldObjects: worldObjectsOf(CARRIED_WORLD_OBJECTS),
    inventories: [
      createInventory(),
      createEquipment(),
      createInventory({id: 46, woIds: '15974863,28491667'}),
      createEquipment({id: 47, woIds: '39187611,65514812'})
    ],
    statistics: [createStatistics()],
    saveConfigurations: [createSaveConfiguration()]
  }).sections;
}

describe('SaveSectionsReaderService', () => {

  it('should extract global metadata', () => {
    // Arrange
    const service = new SaveSectionsReaderService(createSectionsWithTwoPlayers());

    // Act
    const metadata = service.getGlobalMetadata();

    // Assert
    expect(metadata).toEqual<GlobalProgressionValueObject>({
      allTimeTerraTokens: 200_345
    });
  });

  describe('When global metadata are missing', () => {
    it('should use fallback values', () => {
      // Arrange
      const service = new SaveSectionsReaderService(createFakeParsedSave({globalMetadata: []}).sections);

      // Act
      const metadata = service.getGlobalMetadata();

      // Assert
      expect(metadata).toEqual<GlobalProgressionValueObject>({
        allTimeTerraTokens: 0
      });
    });
  });

  it('should extract players section', () => {
    // Arrange
    const service = new SaveSectionsReaderService(createSectionsWithTwoPlayers());

    // Act
    const players = service.getPlayers();

    // Assert
    expect(players).toEqual<PlayerEntity[]>([{
      name: 'Nikowa',
      inventory: ['Phytoplankton3', 'MagnetarQuartz'],
      equipment: ['Backpack4', 'OxygenTank5']
    }, {
      name: 'Chileny',
      inventory: ['Phytoplankton1', 'PulsarQuartz'],
      equipment: ['Backpack7', 'OxygenTank4']
    }]);
  });

  it('should extract terraformation levels', () => {
    // Arrange
    const service = new SaveSectionsReaderService(createSectionsWithTwoPlayers());

    // Act
    const levels = service.getTerraformationLevels();

    // Assert
    expect(levels).toEqual<TerraformationLevelEntity[]>([{
      planetId: 'Toxicity',
      unitOxygenLevel: 100,
      unitHeatLevel: 200,
      unitPressureLevel: 300,
      unitPlantsLevel: 400,
      unitInsectsLevel: 500,
      unitAnimalsLevel: 600,
      unitPurificationLevel: 700
    }]);
  });

  it('should extract statistics', () => {
    // Arrange
    const service = new SaveSectionsReaderService(createSectionsWithTwoPlayers());

    // Act
    const statistics = service.getStatistics();

    // Assert
    expect(statistics).toEqual<StatisticsValueObject>({
      totalCraftedObjects: 10
    });
  });

  describe('When statistics are missing', () => {
    it('should return undefined', () => {
      // Arrange
      const service = new SaveSectionsReaderService(createFakeParsedSave({statistics: []}).sections);

      // Act
      const statistics = service.getStatistics();

      // Assert
      expect(statistics).toBeUndefined();
    });
  });

  it('should extract save configuration', () => {
    // Arrange
    const service = new SaveSectionsReaderService(createSectionsWithTwoPlayers());

    // Act
    const saveConfiguration = service.getSaveConfiguration();

    // Assert
    expect(saveConfiguration).toEqual<SaveConfigurationValueObject>({
      title: 'Merged Save',
      mode: 'Standard',
      modifiers: {
        terraformationPace: 0.1,
        powerConsumption: 0.2,
        gaugeDrain: 0.3,
        meteoOccurrence: 0.4,
        multiplayerFactor: 0.5
      }
    });
  });

  describe('When save configuration is missing', () => {
    it('should return undefined', () => {
      // Arrange
      const service = new SaveSectionsReaderService(createFakeParsedSave({saveConfigurations: []}).sections);

      // Act
      const saveConfiguration = service.getSaveConfiguration();

      // Assert
      expect(saveConfiguration).toBeUndefined();
    });
  });

  describe('When reading energy levels raw data', () => {
    it('should keep every world object but place only those with a position and a planet', () => {
      // Arrange
      const sections = createFakeParsedSave({
        worldObjects: worldObjectsOf([
          {id: 1, gId: 'EnergyGenerator1', pos: '0,0,0', planet: 1},
          {id: 2, gId: 'FuseEnergy1'},
          {id: 3, gId: 'EnergyGenerator1', pos: '10,0,0'},
          {id: 4, gId: 'EnergyGenerator1', planet: 1}
        ] as WorldObject[])
      }).sections;
      const service = new SaveSectionsReaderService(sections);

      // Act
      const rawData = service.getEnergyLevelsRawData();

      // Assert
      expect(rawData).toEqual<EnergyLevelsRawDataValueObject>({
        allWorldObjects: [
          {id: '1', name: 'EnergyGenerator1'},
          {id: '2', name: 'FuseEnergy1'},
          {id: '3', name: 'EnergyGenerator1'},
          {id: '4', name: 'EnergyGenerator1'}
        ],
        inventories: [],
        planets: [{
          planetId: 1,
          planetName: undefined,
          placedWorldObjects: [
            {id: '1', name: 'EnergyGenerator1', position: [0, 0, 0], planetId: 1, inventoryId: undefined}
          ]
        }]
      });
    });

    it('should group placed world objects by planet (Rule EN-PLANET-1)', () => {
      // Arrange
      const sections = createFakeParsedSave({
        worldObjects: worldObjectsOf([
          {id: 1, gId: 'EnergyGenerator1', pos: '0,0,0', planet: 1},
          {id: 2, gId: 'Drill0', pos: '10,0,0', planet: 2},
          {id: 3, gId: 'Heater1', pos: '20,0,0', planet: 1}
        ] as WorldObject[])
      }).sections;
      const service = new SaveSectionsReaderService(sections);

      // Act
      const rawData = service.getEnergyLevelsRawData();

      // Assert
      expect(rawData.planets).toEqual([
        {
          planetId: 1,
          planetName: undefined,
          placedWorldObjects: [
            {id: '1', name: 'EnergyGenerator1', position: [0, 0, 0], planetId: 1, inventoryId: undefined},
            {id: '3', name: 'Heater1', position: [20, 0, 0], planetId: 1, inventoryId: undefined}
          ]
        },
        {
          planetId: 2,
          planetName: undefined,
          placedWorldObjects: [
            {id: '2', name: 'Drill0', position: [10, 0, 0], planetId: 2, inventoryId: undefined}
          ]
        }
      ]);
    });

    it('should label each planet with the name resolved from its numeric id (Rule EN-PLANET-3)', () => {
      // Arrange
      const sections = createFakeParsedSave({
        worldObjects: worldObjectsOf([
          {id: 1, gId: 'EnergyGenerator1', pos: '0,0,0', planet: PRIME_PLANET_NUMERIC_ID},
          {id: 2, gId: 'EnergyGenerator1', pos: '0,0,0', planet: UNKNOWN_PLANET_NUMERIC_ID}
        ] as WorldObject[])
      }).sections;
      const service = new SaveSectionsReaderService(sections);

      // Act
      const rawData = service.getEnergyLevelsRawData();

      // Assert
      expect(rawData.planets.map((planet) => planet.planetName)).toEqual(['Prime', undefined]);
    });

    it('should offer the terraformed planet names as hints when the numeric id is unknown (Rule EN-PLANET-2)', () => {
      // Arrange
      const sections = createFakeParsedSave({
        terraformationLevels: [createTerraformationLevel({planetId: 'Humble'})],
        worldObjects: worldObjectsOf([
          {id: 1, gId: 'Seed7Humble', pos: '0,0,0', planet: 1},
          {id: 2, gId: 'EnergyGenerator1', pos: '10,0,0', planet: 1}
        ] as WorldObject[])
      }).sections;
      const service = new SaveSectionsReaderService(sections);

      // Act
      const rawData = service.getEnergyLevelsRawData();

      // Assert
      expect(rawData.planets.map((planet) => planet.planetName)).toEqual(['Humble']);
    });

    it('should translate the save format fields of a placed world object into business terms', () => {
      // Arrange
      const sections = createFakeParsedSave({
        worldObjects: worldObjectsOf([
          {id: 95585241, gId: 'Optimizer1', pos: '1751.865,-472.58,1106.104', planet: 1, liId: 100}
        ] as WorldObject[])
      }).sections;
      const service = new SaveSectionsReaderService(sections);

      // Act
      const rawData = service.getEnergyLevelsRawData();

      // Assert
      expect(rawData.planets[0].placedWorldObjects).toEqual([{
        id: '95585241',
        name: 'Optimizer1',
        position: [1751.865, -472.58, 1106.104],
        planetId: 1,
        inventoryId: 100
      }]);
    });

    it('should translate the comma separated inventory content into a list of world object ids', () => {
      // Arrange
      const sections = createFakeParsedSave({
        inventories: [
          {id: 100, woIds: '20,21', size: 3},
          {id: 101, woIds: '', size: 1}
        ]
      }).sections;
      const service = new SaveSectionsReaderService(sections);

      // Act
      const rawData = service.getEnergyLevelsRawData();

      // Assert
      expect(rawData.inventories).toEqual([
        {id: 100, worldObjectIds: ['20', '21'], size: 3},
        {id: 101, worldObjectIds: [], size: 1}
      ]);
    });
  });
});
