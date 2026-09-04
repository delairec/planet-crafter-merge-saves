import {SaveSectionsReaderPort} from "../application/ports/SaveSectionsReaderPort";
import {createGlobalProgressionValueObject, GlobalProgressionValueObject} from "../domain/valueObjects/GlobalProgressionValueObject";
import {createPlayerEntity, PlayerEntity} from "../domain/entities/PlayerEntity";
import {createTerraformationLevelEntity, TerraformationLevelEntity} from "../domain/entities/TerraformationLevelEntity";
import {createStatisticsValueObject, StatisticsValueObject} from "../domain/valueObjects/StatisticsValueObject";
import {createSaveConfigurationValueObject, SaveConfigurationValueObject} from "../domain/valueObjects/SaveConfigurationValueObject";
import {
  createEnergyLevelsRawDataValueObject,
  createPlanetWorldObjectsValueObject,
  EnergyLevelsRawDataValueObject
} from "../domain/valueObjects/EnergyLevelsRawDataValueObject";
import {createPlacedWorldObjectEntity} from "../domain/entities/PlacedWorldObjectEntity";

export class FakeSaveParserService implements SaveSectionsReaderPort {
  getEnergyLevelsRawData(): EnergyLevelsRawDataValueObject {
    const producer = createPlacedWorldObjectEntity({id: '1', name: 'EnergyGenerator6' as const, position: [0, 0, 0], planetId: 1});
    const consumer = createPlacedWorldObjectEntity({id: '2', name: 'Drill4' as const, position: [10, 0, 0], planetId: 1});

    return createEnergyLevelsRawDataValueObject({
      allWorldObjects: [producer, consumer],
      inventories: [],
      planets: [createPlanetWorldObjectsValueObject({
        planetId: 1,
        planetName: undefined,
        placedWorldObjects: [producer, consumer]
      })]
    });
  }

  getSaveConfiguration(): SaveConfigurationValueObject {
    return createSaveConfigurationValueObject({
      mode: 'Standard',
      title: 'Fake Save',
      modifiers: {
        terraformationPace: 0.1,
        gaugeDrain: 0.2,
        meteoOccurrence: 0.3,
        multiplayerFactor: 0.4,
        powerConsumption: 0.5
      }
    });
  }

  getStatistics(): StatisticsValueObject {
    return createStatisticsValueObject({
      totalCraftedObjects: 10
    });
  }

  getGlobalMetadata(): GlobalProgressionValueObject {
    return createGlobalProgressionValueObject({allTimeTerraTokens: 1_234_567});
  }

  getPlayers(): PlayerEntity[] {
    return [createPlayerEntity({
      name: 'Nikowa',
      inventory: [],
      equipment: []
    }), createPlayerEntity({
      name: 'Chileny',
      inventory: [],
      equipment: []
    })];
  }

  getTerraformationLevels(): TerraformationLevelEntity[] {
    return [createTerraformationLevelEntity({
      planetId: "Toxicity",
      unitOxygenLevel: 100,
      unitHeatLevel: 200,
      unitPressureLevel: 300,
      unitPlantsLevel: 400,
      unitInsectsLevel: 500,
      unitAnimalsLevel: 600,
      unitPurificationLevel: 700
    })];
  }
}
