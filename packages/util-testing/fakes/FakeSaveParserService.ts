import {SaveParserPort} from "../../util-mapping/application/ports/SaveParserPort";
import {GlobalProgressionValueObject} from "../../util-mapping/domain/valueObjects/GlobalProgressionValueObject";
import {PlayerEntity} from "../../util-mapping/domain/entities/PlayerEntity";
import {TerraformationLevelEntity} from "../../util-mapping/domain/entities/TerraformationLevelEntity";
import {InventoryEntity} from "../../util-mapping/domain/entities/InventoryEntity";
import {StatisticsValueObject} from "../../util-mapping/domain/valueObjects/StatisticsValueObject";
import {SaveConfigurationValueObject} from "../../util-mapping/domain/valueObjects/SaveConfigurationValueObject";

export class FakeSaveParserService implements SaveParserPort {
  getSaveConfiguration(): SaveConfigurationValueObject {
    return {
      mode: 'Standard',
      title: 'Fake Save',
      modifiers: {
        terraformationPace: 0.1,
        gaugeDrain: 0.2,
        meteoOccurrence: 0.3,
        multiplayerFactor: 0.4,
        powerConsumption: 0.5
      }
    }
  }

  getStatistics(): StatisticsValueObject {
    return {
      totalCraftedObjects: 10
    }
  }

  getInventories(): InventoryEntity[] {
    throw new Error("Method not implemented.");
  }

  getGlobalMetadata(): GlobalProgressionValueObject {
    return {allTimeTerraTokens: 1_234_567};
  }

  getPlayers(): PlayerEntity[] {
    return [{
      name: 'Nikowa',
      inventory: [],
      equipment: []
    }, {
      name: 'Chileny',
      inventory: [],
      equipment: []
    }];
  }

  getTerraformationLevels(): TerraformationLevelEntity[] {
    return [{
      planetId: "Toxicity",
      unitOxygenLevel: 100,
      unitHeatLevel: 200,
      unitPressureLevel: 300,
      unitPlantsLevel: 400,
      unitInsectsLevel: 500,
      unitAnimalsLevel: 600,
      unitPurificationLevel: 700
    }];
  }
}
