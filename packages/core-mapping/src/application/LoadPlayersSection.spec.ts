import {describe, expect, it, mock} from 'bun:test';
import {FakeSaveParserService} from "../testing/FakeSaveParserService";
import {SaveSectionsReaderPort} from "./ports/SaveSectionsReaderPort";
import {PlayersPresenterPort} from "./ports/PlayersPresenterPort";
import {LoadPlayersSection} from './LoadPlayersSection';

describe('LoadPlayersSection', () => {
  it('should present all players from the parsed save', () => {
    // Arrange
    const saveParser: SaveSectionsReaderPort = new FakeSaveParserService();
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
