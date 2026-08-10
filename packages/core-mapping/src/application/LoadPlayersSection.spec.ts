import {describe, expect, it, mock} from 'bun:test';
import {FakeSaveParserService} from "../../../util-testing/fakes/FakeSaveParserService";
import {SaveParserPort} from "./ports/SaveParserPort";
import {PlayersPresenterPort} from "./ports/PlayersPresenterPort";
import {LoadPlayersSection} from './LoadPlayersSection';

describe('LoadPlayersSection', () => {
  it('should present all players from the parsed save', () => {
    // Arrange
    const saveParser: SaveParserPort = new FakeSaveParserService();
    const presenter: PlayersPresenterPort = {displayPlayers: mock()};
    const useCase = new LoadPlayersSection(saveParser, presenter);

    // Act
    useCase.execute();

    // Assert
    expect(presenter.displayPlayers).toHaveBeenCalledTimes(1);
    expect(presenter.displayPlayers).toHaveBeenCalledWith([{
      name: 'Nikowa',
      equipment: [],
      inventory: []
    }, {
      name: 'Chileny',
      equipment: [],
      inventory: []
    }]);
  });
});
