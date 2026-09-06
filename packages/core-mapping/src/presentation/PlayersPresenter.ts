import type {PlayersViewModel} from './viewModels/PlayersViewModel.ts';
import type {PlayersPresenterPort} from '../application/ports/PlayersPresenterPort.ts';
import type {PlayerEntity} from "../domain/entities/PlayerEntity.ts";
import {type WorldObjectLabel, worldObjectLabels} from "./worldObjectLabels.ts";
import {
  playersSectionEquipmentLabel,
  playersSectionInventoryLabel,
  playersSectionNoEquipmentMessage,
  playersSectionNoItemsMessage,
  playersSectionUnknownItemLabel
} from "./messages/playersSectionMessages.js";

export class PlayersPresenter implements PlayersPresenterPort {
  private _viewModel: PlayersViewModel;

  constructor() {
    this._viewModel = {
      players: []
    };
  }

  get viewModel(): PlayersViewModel {
    return this._viewModel;
  }

  displayPlayers(players: PlayerEntity[]): void {
    this._viewModel = {
      players: players.map(player => ({
        name: player.name,
        columns: [
          {
            header: playersSectionEquipmentLabel,
            values: mapListWithEmptyMessage(player.equipment, playersSectionNoEquipmentMessage),
          },
          {
            header: playersSectionInventoryLabel,
            values: mapListWithEmptyMessage(player.inventory, playersSectionNoItemsMessage),
          }
        ]
      }))
    };
  }
}

function mapItemNameToItemLabel(itemName: string): string {
  const worldObjectLabel: WorldObjectLabel = worldObjectLabels[itemName];
  return worldObjectLabel ?? playersSectionUnknownItemLabel(itemName);
}

function mapListWithEmptyMessage(list: readonly string[], message: string): string[] {
  return list.length === 0 ? [message] : list.map(mapItemNameToItemLabel);
}
