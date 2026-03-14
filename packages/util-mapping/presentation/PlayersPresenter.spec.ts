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
      headers: ['name', 'equipment', 'inventory'],
      rows: [],
    });
  });

  it('should present all players', () => {
    // Arrange
    const presenter = new PlayersPresenter();
    const playerNikowa: PlayerEntity = {name: 'Nikowa', inventory: ['85274195','48456321'], equipment: ['79111656','58524136']};
    const playerChileny: PlayerEntity = {name: 'Chileny', inventory: [], equipment: []};

    // Act
    presenter.present([playerNikowa, playerChileny]);

    // Assert
    expect(presenter.viewModel.rows).toEqual<PlayersViewModel['rows']>([{
      cells: [{
        value: 'Nikowa'
      }, {
        value: '79111656, 58524136'
      }, {
        value: '85274195, 48456321'
      }]
    },
      {
        cells: [{
          value: 'Chileny'
        }, {
          value: ''
        }, {
          value: ''
        }]
      }]);
  });
});

