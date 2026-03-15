import {PlayersViewModel} from './viewModels/PlayersViewModel';
import {PlayersPresenterPort} from '../application/ports/PlayersPresenterPort';
import {PlayerEntity} from "../domain/entities/PlayerEntity";

export class PlayersPresenter implements PlayersPresenterPort {
  viewModel: PlayersViewModel;

  constructor() {
    this.viewModel = {
      headers: ['name', 'equipment', 'inventory'],
      rows: [],
    };
  }

  present(players: PlayerEntity[]): void {
    this.viewModel.rows = players.map(player => ({
      cells: [{
        value: player.name,
      }, {
        value: player.equipment.join(', '),
      }, {
        value: player.inventory.join(', '),
      }]
    }));
  }
}
