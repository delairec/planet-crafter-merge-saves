import {PlayerEntity} from "../../domain/PlayerEntity";

export interface PlayerPresenterPort {
  present(players: PlayerEntity[]): void;
}


