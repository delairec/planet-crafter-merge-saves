import {beforeEach, describe, expect, it} from 'bun:test';
import {createFakeSaveContent, createPlayer} from 'shared-save-processing/testing/createFakeSaveContent.js';
import {parseSaveSections} from 'shared-save-processing/parseSaveSections.js';
import {PlayerEntity} from "../domain/entities/PlayerEntity";
import {SaveSectionsReaderService} from './SaveSectionsReaderService';
import {GlobalProgressionValueObject} from "../domain/valueObjects/GlobalProgressionValueObject";
import {TerraformationLevelEntity} from "../domain/entities/TerraformationLevelEntity";
import {InventoryEntity} from "../domain/entities/InventoryEntity";
import {WorldObjectEntity} from "../domain/entities/WorldObjectEntity";
import {StatisticsValueObject} from "../domain/valueObjects/StatisticsValueObject";
import {SaveConfigurationValueObject} from "../domain/valueObjects/SaveConfigurationValueObject";
import {ParsedSections} from "shared-save-processing/gameDefinitions";
import {EnergyLevelsValueObject} from "../domain/valueObjects/EnergyLevelsValueObject";
import {
  energyConsumptionLevelsByWorldObjectName,
  energyProductionLevelsByWorldObjectName
} from "../domain/energyLevelsByWorldObjectName";
import {WorldObjectName} from "../domain/worldObjectNames";

describe('SaveSectionsReaderService', () => {
  let sections: ParsedSections;

  beforeEach(() => {
    const fakeSaveContent = createFakeSaveContent(
      {
        players: [
          createPlayer({name: 'Nikowa'}),
          createPlayer({name: 'Chileny', inventoryId: 46, equipmentId: 47})
        ],
      }
    );

    ({sections} = parseSaveSections(fakeSaveContent));
  });

  it('should extract global metadata', () => {
    // Arrange
    const service = new SaveSectionsReaderService(sections);

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
      const sectionsWithoutGlobalMetadata = [...sections];
      sectionsWithoutGlobalMetadata[0] = [];
      // @ts-ignore invalid section on purpose
      const service = new SaveSectionsReaderService(sectionsWithoutGlobalMetadata);

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
    const service = new SaveSectionsReaderService(sections);

    // Act
    const players = service.getPlayers();

    // Assert
    expect(players).toEqual<PlayerEntity[]>([{
      name: 'Nikowa',
      inventory: ['Phytoplankton3', 'MagnetarQuartz'],
      equipment: ['Backpack4','OxygenTank5']
    }, {
      name: 'Chileny',
      inventory: ['Phytoplankton1', 'PulsarQuartz'],
      equipment: ['Backpack7', 'OxygenTank4']
    }]);
  });

  it('should extract terraformation levels', () => {
    // Arrange
    const service = new SaveSectionsReaderService(sections);

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

  it('should extract inventories', () => {
    // Arrange
    const service = new SaveSectionsReaderService(sections);

    // Act
    const inventories = service.getInventories();

    // Assert
    expect(inventories).toEqual<InventoryEntity[]>([
      {id: 44, worldObjectIds: ['79111656', '58524136'], size: 20},
      {id: 45, worldObjectIds: ['85274195', '48456321'], size: 10},
      {id: 46, worldObjectIds: ['15974863', '28491667'], size: 20},
      {id: 47, worldObjectIds: ['39187611', '65514812'], size: 10},
    ]);
  });

  it('should extract world objects', () => {
    // Arrange
    const service = new SaveSectionsReaderService(sections);

    // Act
    const worldObjects = service.getWorldObjects();

    // Assert
    const worldObjectsGenerator = worldObjects(sections);
    expect(worldObjectsGenerator.next().value).toEqual<WorldObjectEntity>({
      id: '79111656',
      name: 'Phytoplankton3'
    });
    expect(worldObjectsGenerator.next().value).toEqual<WorldObjectEntity>({
      id: '58524136',
      name: 'MagnetarQuartz'
    });
    expect(worldObjectsGenerator.next().value).toEqual<WorldObjectEntity>({
      id: '85274195',
      name: 'Backpack4'
    });
    expect(worldObjectsGenerator.next().value).toEqual<WorldObjectEntity>({
      id: '48456321',
      name: 'OxygenTank5'
    });
  });

  it('should extract statistics', () => {
    // Arrange
    const service = new SaveSectionsReaderService(sections);

    // Act
    const statistics = service.getStatistics();

    // Assert
    expect(statistics).toEqual<StatisticsValueObject>({
      totalCraftedObjects: 10
    });
  });

  it('should extract save configuration', () => {
    // Arrange
    const service = new SaveSectionsReaderService(sections);

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

  describe('When computing energy levels', () => {
    it.each(Object.entries(energyProductionLevelsByWorldObjectName).map(([worldObjectName, kilowatts]) => ({
      worldObjectName,
      kilowatts
    })))(
      'should count $worldObjectName as producing $kilowatts kW',
      ({worldObjectName, kilowatts}) => {
        // Arrange
        const fakeSaveContent = createFakeSaveContent({
          worldObjects: [{id: 1, gId: worldObjectName, pos: '0,0,0', planet: 1}],
        });
        const {sections: sectionsWithProducer} = parseSaveSections(fakeSaveContent);
        const service = new SaveSectionsReaderService(sectionsWithProducer);

        // Act
        const energyLevels = service.getEnergyLevels();

        // Assert
        expect(energyLevels).toEqual<EnergyLevelsValueObject>({
          planets: [{
            planetId: 1,
            planetName: undefined,
            production: kilowatts,
            consumption: 0,
            available: kilowatts,
            productionBreakdown: [{
              name: worldObjectName as WorldObjectName,
              quantity: 1,
              unitLevel: kilowatts,
              totalLevel: kilowatts
            }],
            consumptionBreakdown: [],
            optimizers: [],
          }]
        });
      }
    );

    it.each(Object.entries(energyConsumptionLevelsByWorldObjectName).map(([worldObjectName, kilowatts]) => ({
      worldObjectName,
      kilowatts
    })))(
      'should count $worldObjectName as consuming $kilowatts kW',
      ({worldObjectName, kilowatts}) => {
        // Arrange
        const fakeSaveContent = createFakeSaveContent({
          worldObjects: [{id: 1, gId: worldObjectName, pos: '0,0,0', planet: 1}],
        });
        const {sections: sectionsWithConsumer} = parseSaveSections(fakeSaveContent);
        const service = new SaveSectionsReaderService(sectionsWithConsumer);

        // Act
        const energyLevels = service.getEnergyLevels();

        // Assert
        expect(energyLevels).toEqual<EnergyLevelsValueObject>({
          planets: [{
            planetId: 1,
            planetName: undefined,
            production: 0,
            consumption: kilowatts,
            available: -kilowatts,
            productionBreakdown: [],
            consumptionBreakdown: [{
              name: worldObjectName as WorldObjectName,
              quantity: 1,
              unitLevel: kilowatts,
              totalLevel: kilowatts
            }],
            optimizers: [],
          }]
        });
      }
    );

    it('should sum multiple world objects of the same kind', () => {
      // Arrange
      const fakeSaveContent = createFakeSaveContent({
        worldObjects: [
          {id: 1, gId: 'EnergyGenerator1', pos: '0,0,0', planet: 1},
          {id: 2, gId: 'EnergyGenerator1', pos: '10,0,0', planet: 1},
          {id: 3, gId: 'Drill0', pos: '0,10,0', planet: 1},
          {id: 4, gId: 'Drill0', pos: '10,10,0', planet: 1},
        ],
      });
      const {sections: sectionsWithTwoProducersAndTwoConsumers} = parseSaveSections(fakeSaveContent);
      const service = new SaveSectionsReaderService(sectionsWithTwoProducersAndTwoConsumers);

      // Act
      const energyLevels = service.getEnergyLevels();

      // Assert
      expect(energyLevels).toEqual<EnergyLevelsValueObject>({
        planets: [{
          planetId: 1,
          planetName: undefined,
          production: 2.4,
          consumption: 1,
          available: 1.4,
          productionBreakdown: [{
            name: 'EnergyGenerator1',
            quantity: 2,
            unitLevel: 1.2,
            totalLevel: 2.4
          }],
          consumptionBreakdown: [{
            name: 'Drill0',
            quantity: 2,
            unitLevel: 0.5,
            totalLevel: 1
          }],
          optimizers: [],
        }]
      });
    });

    it('should compute available energy as production minus consumption', () => {
      // Arrange
      const fakeSaveContent = createFakeSaveContent({
        worldObjects: [
          {id: 1, gId: 'EnergyGenerator6', pos: '0,0,0', planet: 1},
          {id: 2, gId: 'Drill4', pos: '10,0,0', planet: 1},
        ],
      });
      const {sections: sectionsWithProducerAndConsumer} = parseSaveSections(fakeSaveContent);
      const service = new SaveSectionsReaderService(sectionsWithProducerAndConsumer);

      // Act
      const energyLevels = service.getEnergyLevels();

      // Assert
      expect(energyLevels).toEqual<EnergyLevelsValueObject>({
        planets: [{
          planetId: 1,
          planetName: undefined,
          production: 1485,
          consumption: 375.5,
          available: 1109.5,
          productionBreakdown: [{
            name: 'EnergyGenerator6',
            quantity: 1,
            unitLevel: 1485,
            totalLevel: 1485
          }],
          consumptionBreakdown: [{
            name: 'Drill4',
            quantity: 1,
            unitLevel: 375.5,
            totalLevel: 375.5
          }],
          optimizers: [],
        }]
      });
    });

    it('should ignore world objects without a position (not placed) when computing energy levels', () => {
      // Arrange
      const fakeSaveContent = createFakeSaveContent({
        worldObjects: [
          {id: 1, gId: 'EnergyGenerator1', pos: '0,0,0', planet: 1},
          {id: 2, gId: 'EnergyGenerator1'},
          {id: 3, gId: 'Drill0', pos: '10,0,0', planet: 1},
          {id: 4, gId: 'Drill0'},
        ],
      });
      const {sections} = parseSaveSections(fakeSaveContent);
      const service = new SaveSectionsReaderService(sections);

      // Act
      const energyLevels = service.getEnergyLevels();

      // Assert
      expect(energyLevels).toEqual<EnergyLevelsValueObject>({
        planets: [{
          planetId: 1,
          planetName: undefined,
          production: 1.2,
          consumption: 0.5,
          available: 0.7,
          productionBreakdown: [{
            name: 'EnergyGenerator1',
            quantity: 1,
            unitLevel: 1.2,
            totalLevel: 1.2
          }],
          consumptionBreakdown: [{
            name: 'Drill0',
            quantity: 1,
            unitLevel: 0.5,
            totalLevel: 0.5
          }],
          optimizers: [],
        }]
      });
    });

    describe('When a save has world objects on multiple planets (Rule EN-PLANET-1)', () => {
      it('should compute independent production and consumption per planet without mixing them', () => {
        // Arrange
        const fakeSaveContent = createFakeSaveContent({
          worldObjects: [
            {id: 1, gId: 'EnergyGenerator1', pos: '0,0,0', planet: 1},
            {id: 2, gId: 'Drill0', pos: '10,0,0', planet: 1},
            {id: 3, gId: 'EnergyGenerator6', pos: '0,0,0', planet: 2},
            {id: 4, gId: 'Drill4', pos: '10,0,0', planet: 2},
          ],
        });
        const {sections} = parseSaveSections(fakeSaveContent);
        const service = new SaveSectionsReaderService(sections);

        // Act
        const energyLevels = service.getEnergyLevels();

        // Assert
        expect(energyLevels).toEqual<EnergyLevelsValueObject>({
          planets: [
            {
              planetId: 1,
              planetName: undefined,
              production: 1.2,
              consumption: 0.5,
              available: 0.7,
              productionBreakdown: [{
                name: 'EnergyGenerator1',
                quantity: 1,
                unitLevel: 1.2,
                totalLevel: 1.2
              }],
              consumptionBreakdown: [{
                name: 'Drill0',
                quantity: 1,
                unitLevel: 0.5,
                totalLevel: 0.5
              }],
              optimizers: [],
            },
            {
              planetId: 2,
              planetName: undefined,
              production: 1485,
              consumption: 375.5,
              available: 1109.5,
              productionBreakdown: [{
                name: 'EnergyGenerator6',
                quantity: 1,
                unitLevel: 1485,
                totalLevel: 1485
              }],
              consumptionBreakdown: [{
                name: 'Drill4',
                quantity: 1,
                unitLevel: 375.5,
                totalLevel: 375.5
              }],
              optimizers: [],
            }
          ]
        });
      });
    });

    describe('When a world object is on a planet with a known numeric ID (Rule EN-PLANET-3)', () => {
      it('should label the planet using the static planet names table, without relying on gId', () => {
        // Arrange
        const fakeSaveContent = createFakeSaveContent({
          worldObjects: [
            {id: 1, gId: 'EnergyGenerator1', pos: '0,0,0', planet: -1140328421},
          ],
        });
        const {sections} = parseSaveSections(fakeSaveContent);
        const service = new SaveSectionsReaderService(sections);

        // Act
        const energyLevels = service.getEnergyLevels();

        // Assert
        expect(energyLevels.planets[0].planetName).toBe('Prime');
      });
    });

    describe('When a world object gId embeds a known planet name (Rule EN-PLANET-2)', () => {
      it('should label the planet using the matching planet name instead of the fallback', () => {
        // Arrange
        const fakeSaveContent = createFakeSaveContent({
          terraformationLevels: [{
            planetId: 'Humble',
            unitOxygenLevel: 0,
            unitHeatLevel: 0,
            unitPressureLevel: 0,
            unitPlantsLevel: 0,
            unitInsectsLevel: 0,
            unitAnimalsLevel: 0,
            unitPurificationLevel: -1
          }],
          worldObjects: [
            {id: 1, gId: 'Seed7Humble', pos: '0,0,0', planet: 1},
            {id: 2, gId: 'EnergyGenerator1', pos: '10,0,0', planet: 1},
          ],
        });
        const {sections} = parseSaveSections(fakeSaveContent);
        const service = new SaveSectionsReaderService(sections);

        // Act
        const energyLevels = service.getEnergyLevels();

        // Assert
        expect(energyLevels.planets[0].planetName).toBe('Humble');
      });
    });

    describe('When an Optimizer holds an Energy Fuse', () => {
      it('should boost a producer within radius to 150% for a single fuse', () => {
        // Arrange
        const fakeSaveContent = createFakeSaveContent({
          worldObjects: [
            {id: 10, gId: 'Optimizer1', pos: '0,0,0', planet: 1, liId: 100},
            {id: 20, gId: 'FuseEnergy1'},
            {id: 30, gId: 'EnergyGenerator1', pos: '10,0,0', planet: 1},
          ],
          inventories: [{id: 100, woIds: '20', size: 1}],
        });
        const {sections} = parseSaveSections(fakeSaveContent);
        const service = new SaveSectionsReaderService(sections);

        // Act
        const energyLevels = service.getEnergyLevels();

        // Assert
        expect(energyLevels.planets[0].production).toBeCloseTo(1.2 * 1.5);
      });

      it('should not boost a producer beyond the optimizer radius', () => {
        // Arrange
        const fakeSaveContent = createFakeSaveContent({
          worldObjects: [
            {id: 10, gId: 'Optimizer1', pos: '0,0,0', planet: 1, liId: 100},
            {id: 20, gId: 'FuseEnergy1'},
            {id: 30, gId: 'EnergyGenerator1', pos: '200,0,0', planet: 1},
          ],
          inventories: [{id: 100, woIds: '20', size: 1}],
        });
        const {sections} = parseSaveSections(fakeSaveContent);
        const service = new SaveSectionsReaderService(sections);

        // Act
        const energyLevels = service.getEnergyLevels();

        // Assert
        expect(energyLevels.planets[0].production).toBeCloseTo(1.2);
      });

      it('should not boost a producer on a different planet', () => {
        // Arrange
        const fakeSaveContent = createFakeSaveContent({
          worldObjects: [
            {id: 10, gId: 'Optimizer1', pos: '0,0,0', planet: 1, liId: 100},
            {id: 20, gId: 'FuseEnergy1'},
            {id: 30, gId: 'EnergyGenerator1', pos: '10,0,0', planet: 2},
          ],
          inventories: [{id: 100, woIds: '20', size: 1}],
        });
        const {sections} = parseSaveSections(fakeSaveContent);
        const service = new SaveSectionsReaderService(sections);

        // Act
        const energyLevels = service.getEnergyLevels();

        // Assert: the producer's own planet keeps its unboosted base production
        const producerPlanet = energyLevels.planets.find((planet) => planet.production > 0);
        expect(producerPlanet?.production).toBeCloseTo(1.2);
      });

      it('should ignore an Optimizer without any Energy Fuse in its inventory', () => {
        // Arrange
        const fakeSaveContent = createFakeSaveContent({
          worldObjects: [
            {id: 10, gId: 'Optimizer1', pos: '0,0,0', planet: 1, liId: 100},
            {id: 30, gId: 'EnergyGenerator1', pos: '10,0,0', planet: 1},
          ],
          inventories: [{id: 100, woIds: '', size: 1}],
        });
        const {sections} = parseSaveSections(fakeSaveContent);
        const service = new SaveSectionsReaderService(sections);

        // Act
        const energyLevels = service.getEnergyLevels();

        // Assert
        expect(energyLevels.planets[0].production).toBeCloseTo(1.2);
      });

      it('should stack multiple fuses in a T2 Optimizer additively by raw percentage (EN-FUSE-3)', () => {
        // Arrange
        const fakeSaveContent = createFakeSaveContent({
          worldObjects: [
            {id: 10, gId: 'Optimizer2', pos: '0,0,0', planet: 1, liId: 100},
            {id: 20, gId: 'FuseEnergy1'},
            {id: 21, gId: 'FuseEnergy1'},
            {id: 30, gId: 'EnergyGenerator1', pos: '10,0,0', planet: 1},
          ],
          inventories: [{id: 100, woIds: '20,21', size: 3}],
        });
        const {sections} = parseSaveSections(fakeSaveContent);
        const service = new SaveSectionsReaderService(sections);

        // Act
        const energyLevels = service.getEnergyLevels();

        // Assert: 2 fuses => 2 × 150% = 300%
        expect(energyLevels.planets[0].production).toBeCloseTo(1.2 * 3);
      });

      it('should stack fuses from two different Optimizers reaching the same producer (EN-OPT-3)', () => {
        // Arrange
        const fakeSaveContent = createFakeSaveContent({
          worldObjects: [
            {id: 10, gId: 'Optimizer1', pos: '0,0,0', planet: 1, liId: 100},
            {id: 11, gId: 'Optimizer1', pos: '20,0,0', planet: 1, liId: 101},
            {id: 20, gId: 'FuseEnergy1'},
            {id: 21, gId: 'FuseEnergy1'},
            {id: 30, gId: 'EnergyGenerator1', pos: '10,0,0', planet: 1},
          ],
          inventories: [
            {id: 100, woIds: '20', size: 1},
            {id: 101, woIds: '21', size: 1},
          ],
        });
        const {sections} = parseSaveSections(fakeSaveContent);
        const service = new SaveSectionsReaderService(sections);

        // Act
        const energyLevels = service.getEnergyLevels();

        // Assert: 2 fuses total (1 from each optimizer) => 2 × 150% = 300%
        expect(energyLevels.planets[0].production).toBeCloseTo(1.2 * 3);
      });

      it('should only boost the closest machines up to the optimizer capacity (EN-OPT-2)', () => {
        // Arrange: T1 Optimizer boosts at most 5 machines; add 6 eligible producers in range.
        const producers = Array.from({length: 6}, (_, index) => ({
          id: 30 + index,
          gId: 'EnergyGenerator1',
          pos: `${10 + index},0,0`,
          planet: 1,
        }));
        const fakeSaveContent = createFakeSaveContent({
          worldObjects: [
            {id: 10, gId: 'Optimizer1', pos: '0,0,0', planet: 1, liId: 100},
            {id: 20, gId: 'FuseEnergy1'},
            ...producers,
          ],
          inventories: [{id: 100, woIds: '20', size: 1}],
        });
        const {sections} = parseSaveSections(fakeSaveContent);
        const service = new SaveSectionsReaderService(sections);

        // Act
        const energyLevels = service.getEnergyLevels();

        // Assert: 5 boosted producers at 150% + 1 unboosted at 100%
        expect(energyLevels.planets[0].production).toBeCloseTo(1.2 * 1.5 * 5 + 1.2);
      });
    });

    describe('When building the optimizers breakdown', () => {
      it('should describe the boosted machines and fuse count for each qualifying Optimizer', () => {
        // Arrange
        const fakeSaveContent = createFakeSaveContent({
          worldObjects: [
            {id: 10, gId: 'Optimizer1', pos: '0,0,0', planet: 1, liId: 100},
            {id: 20, gId: 'FuseEnergy1'},
            {id: 30, gId: 'EnergyGenerator1', pos: '10,0,0', planet: 1},
          ],
          inventories: [{id: 100, woIds: '20', size: 1}],
        });
        const {sections} = parseSaveSections(fakeSaveContent);
        const service = new SaveSectionsReaderService(sections);

        // Act
        const energyLevels = service.getEnergyLevels();

        // Assert: 1 fuse boosting 1 Wind turbine => contribution = 1.2 × (1 × 1.5 − 1) (base already counted in production breakdown)
        expect(energyLevels.planets[0].optimizers).toEqual([{
          name: 'Optimizer1',
          fuseCount: 1,
          boostedMachines: [{name: 'EnergyGenerator1', quantity: 1}],
          contribution: 1.2 * (1 * 1.5 - 1)
        }]);
      });

      it('should not include an Optimizer without any Energy Fuse in its inventory', () => {
        // Arrange
        const fakeSaveContent = createFakeSaveContent({
          worldObjects: [
            {id: 10, gId: 'Optimizer1', pos: '0,0,0', planet: 1, liId: 100},
            {id: 30, gId: 'EnergyGenerator1', pos: '10,0,0', planet: 1},
          ],
          inventories: [{id: 100, woIds: '', size: 1}],
        });
        const {sections} = parseSaveSections(fakeSaveContent);
        const service = new SaveSectionsReaderService(sections);

        // Act
        const energyLevels = service.getEnergyLevels();

        // Assert
        expect(energyLevels.planets[0].optimizers).toEqual([]);
      });

      it('should split a shared producer\'s boost between optimizers proportionally to their fuse count', () => {
        // Arrange
        const fakeSaveContent = createFakeSaveContent({
          worldObjects: [
            {id: 10, gId: 'Optimizer1', pos: '0,0,0', planet: 1, liId: 100},
            {id: 11, gId: 'Optimizer1', pos: '20,0,0', planet: 1, liId: 101},
            {id: 20, gId: 'FuseEnergy1'},
            {id: 21, gId: 'FuseEnergy1'},
            {id: 30, gId: 'EnergyGenerator1', pos: '10,0,0', planet: 1},
          ],
          inventories: [
            {id: 100, woIds: '20', size: 1},
            {id: 101, woIds: '21', size: 1},
          ],
        });
        const {sections} = parseSaveSections(fakeSaveContent);
        const service = new SaveSectionsReaderService(sections);

        // Act
        const energyLevels = service.getEnergyLevels();

        // Assert: each Optimizer holds 1 fuse; the producer's real combined boost (2 fuses × 1.5 −
        // base) is split evenly between the two Optimizers since they each hold 1 fuse.
        expect(energyLevels.planets[0].optimizers).toEqual([
          {
            name: 'Optimizer1',
            fuseCount: 1,
            boostedMachines: [{name: 'EnergyGenerator1', quantity: 1}],
            contribution: 1.2 * (2 * 1.5 - 1) / 2
          },
          {
            name: 'Optimizer1',
            fuseCount: 1,
            boostedMachines: [{name: 'EnergyGenerator1', quantity: 1}],
            contribution: 1.2 * (2 * 1.5 - 1) / 2
          }
        ]);
      });
    });
  });
});

