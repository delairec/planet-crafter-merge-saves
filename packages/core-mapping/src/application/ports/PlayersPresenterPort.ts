import type {PlayerEntity} from "../../domain/entities/PlayerEntity.ts";

export interface PlayersPresenterPort {
  displayPlayers(players: PlayerEntity[]): void;
}


