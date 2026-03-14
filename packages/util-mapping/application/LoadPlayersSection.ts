import { PlayersPresenterPort } from './ports/PlayersPresenterPort';
import { SaveParserPort } from './ports/SaveParserPort';

export class LoadPlayersSection {
  constructor(
    private readonly saveParser: SaveParserPort,
    private readonly presenter: PlayersPresenterPort,
  ) {}

  execute(): void {
    const players = this.saveParser.getPlayers();
    this.presenter.present(players);
  }
}
