import {describe, expect, it, mock} from 'bun:test';
import {FakeSaveParserService} from "../../util-testing/fakes/FakeSaveParserService";
import {SaveParserPort} from "./ports/SaveParserPort";
import {PlayersPresenterPort} from "./ports/PlayersPresenterPort";
import {LoadPlayersSection} from './LoadPlayersSection';

describe('LoadPlayersSection', () => {
  it('should present all players from the parsed save', () => {
    // Arrange
    const saveParser: SaveParserPort = new FakeSaveParserService();
    const presenter: PlayersPresenterPort = {present: mock()};
    const useCase = new LoadPlayersSection(saveParser, presenter);

    // Act
    useCase.execute();

    // Assert
    expect(presenter.present).toHaveBeenCalledTimes(1);
    expect(presenter.present).toHaveBeenCalledWith([{name:'Nikowa'}, {name:'Chileny'}]);
  });
});
