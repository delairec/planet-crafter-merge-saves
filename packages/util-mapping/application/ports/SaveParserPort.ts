import {PlayerEntity} from "../../domain/entities/PlayerEntity";
import {GlobalProgressionValueObject} from "../../domain/valueObjects/GlobalProgressionValueObject";
import {TerraformationLevelEntity} from "../../domain/entities/TerraformationLevelEntity";
import {InventoryEntity} from "../../domain/entities/InventoryEntity";
import {StatisticsValueObject} from "../../domain/valueObjects/StatisticsValueObject";
import {SaveConfigurationValueObject} from "../../domain/valueObjects/SaveConfigurationValueObject";

export interface SaveParserPort {
  getPlayers(): PlayerEntity[];

  getGlobalMetadata(): GlobalProgressionValueObject;

  getTerraformationLevels(): TerraformationLevelEntity[];

  getInventories(): InventoryEntity[];

  getStatistics(): StatisticsValueObject;

  getSaveConfiguration(): SaveConfigurationValueObject;
}
