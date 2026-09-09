import {PlayerEntity} from "../../domain/entities/PlayerEntity";

export interface PlayersPresenterPort {
  displayPlayers(players: PlayerEntity[]): void;
}


