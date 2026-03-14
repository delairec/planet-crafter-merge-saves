import {PlayerEntity} from "../../domain/PlayerEntity";
import {GlobalProgressionEntity} from "../../domain/GlobalProgressionEntity";
import {TerraformationLevelEntity} from "../../domain/TerraformationLevelEntity";

export interface SaveParserPort {
  getPlayers(): PlayerEntity[];
  getGlobalMetadata(): GlobalProgressionEntity;
  getTerraformationLevels(): TerraformationLevelEntity[];
}
