import {PlayersViewModel} from './viewModels/PlayersViewModel';
import {PlayersPresenterPort} from '../application/ports/PlayersPresenterPort';
import {PlayerEntity} from "../domain/PlayerEntity";

export class PlayersPresenter implements PlayersPresenterPort {
  viewModel: PlayersViewModel;

  constructor() {
    this.viewModel = {
      players: [],
    };
  }

  present(players: PlayerEntity[]): void {
    this.viewModel.players = players.map(player => ({ name: player.name }));
  }
}
