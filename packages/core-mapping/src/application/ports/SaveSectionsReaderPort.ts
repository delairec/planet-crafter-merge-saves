import {PlayerEntity} from "../../domain/entities/PlayerEntity";
import {GlobalProgressionValueObject} from "../../domain/valueObjects/GlobalProgressionValueObject";
import {TerraformationLevelEntity} from "../../domain/entities/TerraformationLevelEntity";
import {StatisticsValueObject} from "../../domain/valueObjects/StatisticsValueObject";
import {SaveConfigurationValueObject} from "../../domain/valueObjects/SaveConfigurationValueObject";
import {EnergyLevelsRawDataValueObject} from "../../domain/valueObjects/EnergyLevelsRawDataValueObject";

export interface SaveSectionsReaderPort {
  getPlayers(): PlayerEntity[];

  getGlobalMetadata(): GlobalProgressionValueObject;

  getTerraformationLevels(): TerraformationLevelEntity[];

  getStatistics(): StatisticsValueObject | undefined;

  getSaveConfiguration(): SaveConfigurationValueObject | undefined;

  getEnergyLevelsRawData(): EnergyLevelsRawDataValueObject;
}
