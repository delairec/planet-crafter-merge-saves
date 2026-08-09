import {PlayersViewModel} from './viewModels/PlayersViewModel';
import {PlayersPresenterPort} from '../application/ports/PlayersPresenterPort';
import {PlayerEntity} from "../domain/entities/PlayerEntity";
import {WorldObjectLabel, worldObjectLabels} from "../domain/worldObjectLabels";

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

  private mapItemNameToItemLabel(itemName: string) {
    const worldObjectLabel: WorldObjectLabel = worldObjectLabels[itemName];
    return worldObjectLabel ?? `Unknown Item (${itemName})`;
  }

  private mapListWithEmptyMessage(list: string[], message: string) {
    return list.length === 0 ? [message] : list.map(this.mapItemNameToItemLabel);
  }
}
