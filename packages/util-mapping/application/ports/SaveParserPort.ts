import {PlayerEntity} from "../../domain/PlayerEntity";
import {GlobalProgressionEntity} from "../../domain/GlobalProgressionEntity";

export interface SaveParserPort {
  getPlayers(): PlayerEntity[];

  getGlobalMetadata(): GlobalProgressionEntity;
}


