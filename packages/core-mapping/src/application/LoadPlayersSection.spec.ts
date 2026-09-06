import {describe, expect, it, mock} from 'bun:test';
import {FakeSaveParserService} from "../testing/FakeSaveParserService.ts";
import type {SaveSectionsReaderPort} from "./ports/SaveSectionsReaderPort.ts";
import type {PlayersPresenterPort} from "./ports/PlayersPresenterPort.ts";
import {LoadPlayersSection} from './LoadPlayersSection.ts';

describe('LoadPlayersSection', () => {
  it('should present all players from the parsed save', async () => {
    // Arrange
    const saveParser: SaveSectionsReaderPort = new FakeSaveParserService();
    const presenter: PlayersPresenterPort = {displayPlayers: mock()};
    const useCase = new LoadPlayersSection(saveParser, presenter);

    // Act
    await useCase.execute();

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
