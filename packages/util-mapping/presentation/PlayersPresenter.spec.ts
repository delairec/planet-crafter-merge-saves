import {describe, expect, it} from 'bun:test';
import {PlayersPresenter} from './PlayersPresenter';
import {PlayersViewModel} from './viewModels/PlayersViewModel';
import {PlayerEntity} from "../domain/entities/PlayerEntity";

describe('PlayersPresenter', () => {
  it('should initialize with default view model', () => {
    // Act
    const presenter = new PlayersPresenter();

    // Assert
    expect(presenter.viewModel).toEqual<PlayersViewModel>({
      players: []
    });
  });

  it('should present all players', () => {
    // Arrange
    const presenter = new PlayersPresenter();
    const playerNikowa: PlayerEntity = {name: 'Nikowa', inventory: ['Phytoplankton3','MagnetarQuartz'], equipment: ['Backpack4', 'OxygenTank5']};
    const playerChileny: PlayerEntity = {name: 'Chileny', inventory: [], equipment: []};

    // Act
    presenter.present([playerNikowa, playerChileny]);

    // Assert
    expect(presenter.viewModel).toEqual<PlayersViewModel>({
      players: [
        {
          name: 'Nikowa',
          columns: [
            {
              header: 'Equipment',
              values: ['Backpack4', 'OxygenTank5']
            },
            {
              header: 'Inventory',
              values: ['Phytoplankton3', 'MagnetarQuartz']
            }
          ]
        }, {
          name: 'Chileny',
          columns: [
            {
              header: 'Equipment',
              values: []
            },
            {
              header: 'Inventory',
              values: []
            }
          ]
        }]
    });
  });
});

