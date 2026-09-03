import {PlayersViewModel} from './viewModels/PlayersViewModel';
import {PlayersPresenterPort} from '../application/ports/PlayersPresenterPort';
import {PlayerEntity} from "../domain/entities/PlayerEntity";
import {WorldObjectLabel, worldObjectLabels} from "../domain/worldObjectLabels";
import {
  playersSectionEquipmentLabel,
  playersSectionInventoryLabel,
  playersSectionNoEquipmentMessage,
  playersSectionNoItemsMessage,
  playersSectionUnknownItemLabel
} from "util-messages/playersSectionMessages.js";

export class PlayersPresenter implements PlayersPresenterPort {
  viewModel: PlayersViewModel;

  constructor() {
    this.viewModel = {
      players: []
    };
  }

  displayPlayers(players: PlayerEntity[]): void {
    this.viewModel.players = players.map(player => ({
      name: player.name,
      columns: [
        {
          header: playersSectionEquipmentLabel,
          values: this.mapListWithEmptyMessage(player.equipment, playersSectionNoEquipmentMessage),
        },
        {
          header: playersSectionInventoryLabel,
          values: this.mapListWithEmptyMessage(player.inventory, playersSectionNoItemsMessage),
        }
      ]
    }));
  }

  private mapItemNameToItemLabel(itemName: string) {
    const worldObjectLabel: WorldObjectLabel = worldObjectLabels[itemName];
    return worldObjectLabel ?? playersSectionUnknownItemLabel(itemName);
  }

  private mapListWithEmptyMessage(list: string[], message: string) {
    return list.length === 0 ? [message] : list.map(this.mapItemNameToItemLabel);
  }
}
