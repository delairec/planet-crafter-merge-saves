import {PlayersViewModel} from './viewModels/PlayersViewModel';
import {PlayersPresenterPort} from '../application/ports/PlayersPresenterPort';
import {PlayerEntity} from "../domain/entities/PlayerEntity";
import {worldObjectIds} from "./idMapping/worldObjectIds";

export class PlayersPresenter implements PlayersPresenterPort {
  viewModel: PlayersViewModel;

  constructor() {
    this.viewModel = {
      players: []
    };
  }

  present(players: PlayerEntity[]): void {
    this.viewModel.players = players.map(player => ({
      name: player.name,
      columns: [
        {
          header: 'Equipment',
          values: this.mapListWithEmptyMessage(player.equipment, '(/) No equipment'),
        },
        {
          header: 'Inventory',
          values: this.mapListWithEmptyMessage(player.inventory, '(/) No items'),
        }
      ]
    }));
  }

  private mapItemIdToItemName(itemId: string) {
    const worldObjectName: string = worldObjectIds[itemId];
    return worldObjectName ?? `Unknown Item (${itemId})`;
  }

  private mapListWithEmptyMessage(list: string[], message: string) {
    return list.length === 0 ? [message] : list.map(this.mapItemIdToItemName);
  }
}
