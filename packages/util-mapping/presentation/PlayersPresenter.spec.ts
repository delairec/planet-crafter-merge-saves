import {describe, expect, it} from 'bun:test';
import {PlayersPresenter} from './PlayersPresenter';
import {PlayersViewModel} from './viewModels/PlayersViewModel';

describe('PlayersPresenter', () => {
  it('should initialize with default view model', () => {
    // Act
    const presenter = new PlayersPresenter();

    // Assert
    expect(presenter.viewModel).toEqual<PlayersViewModel>({players: []});
  });

  it('should present all players', () => {
    // Arrange
    const presenter = new PlayersPresenter();

    // Act
    presenter.present([{name: 'Nikowa'}, {name: 'Chileny'}]);

    // Assert
    expect(presenter.viewModel).toEqual<PlayersViewModel>({players: [{name: 'Nikowa'}, {name: 'Chileny'}]});
  });
});

