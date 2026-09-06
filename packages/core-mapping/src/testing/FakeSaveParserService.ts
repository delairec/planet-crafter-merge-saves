import type {SaveSectionsReaderPort} from "../application/ports/SaveSectionsReaderPort.ts";
import {createGlobalProgressionValueObject, type GlobalProgressionValueObject} from "../domain/valueObjects/GlobalProgressionValueObject.ts";
import {createPlayerEntity, type PlayerEntity} from "../domain/entities/PlayerEntity.ts";
import {createTerraformationLevelEntity, type TerraformationLevelEntity} from "../domain/entities/TerraformationLevelEntity.ts";
import {createStatisticsValueObject, type StatisticsValueObject} from "../domain/valueObjects/StatisticsValueObject.ts";
import {createSaveConfigurationValueObject, type SaveConfigurationValueObject} from "../domain/valueObjects/SaveConfigurationValueObject.ts";
import {
  createEnergyLevelsRawDataValueObject,
  createPlanetWorldObjectsValueObject,
  type EnergyLevelsRawDataValueObject
} from "../domain/valueObjects/EnergyLevelsRawDataValueObject.ts";
import {createPlacedWorldObjectEntity} from "../domain/entities/PlacedWorldObjectEntity.ts";

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
