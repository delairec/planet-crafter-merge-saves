import type {PlayerEntity} from "../../domain/entities/PlayerEntity.ts";
import type {GlobalProgressionValueObject} from "../../domain/valueObjects/GlobalProgressionValueObject.ts";
import type {TerraformationLevelEntity} from "../../domain/entities/TerraformationLevelEntity.ts";
import type {StatisticsValueObject} from "../../domain/valueObjects/StatisticsValueObject.ts";
import type {SaveConfigurationValueObject} from "../../domain/valueObjects/SaveConfigurationValueObject.ts";
import type {EnergyLevelsRawDataValueObject} from "../../domain/valueObjects/EnergyLevelsRawDataValueObject.ts";

export interface SaveSectionsReaderPort {
  getPlayers(): PlayerEntity[];

  getGlobalMetadata(): GlobalProgressionValueObject;

  getTerraformationLevels(): TerraformationLevelEntity[];

  getStatistics(): StatisticsValueObject | undefined;

  getSaveConfiguration(): SaveConfigurationValueObject | undefined;

  getEnergyLevelsRawData(): EnergyLevelsRawDataValueObject;
}
