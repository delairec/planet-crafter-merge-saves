import {PlayerEntity} from "../../domain/entities/PlayerEntity";
import {GlobalProgressionValueObject} from "../../domain/valueObjects/GlobalProgressionValueObject";
import {TerraformationLevelEntity} from "../../domain/entities/TerraformationLevelEntity";
import {InventoryEntity} from "../../domain/entities/InventoryEntity";

export interface SaveParserPort {
  getPlayers(): PlayerEntity[];
  getGlobalMetadata(): GlobalProgressionValueObject;
  getTerraformationLevels(): TerraformationLevelEntity[];
  getInventories(): InventoryEntity[];
}
