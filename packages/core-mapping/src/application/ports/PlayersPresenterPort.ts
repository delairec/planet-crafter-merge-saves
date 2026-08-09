import {PlayerEntity} from "../../domain/entities/PlayerEntity";

export interface PlayersPresenterPort {
  present(players: PlayerEntity[]): void;
}


