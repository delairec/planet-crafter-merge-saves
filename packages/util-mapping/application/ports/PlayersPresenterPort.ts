import {PlayerEntity} from "../../domain/PlayerEntity";

export interface PlayersPresenterPort {
  present(players: PlayerEntity[]): void;
}


