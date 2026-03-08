import {PlayerEntity} from "../../domain/PlayerEntity";

export interface SaveParserPort {
  getPlayers(): PlayerEntity[];
}


