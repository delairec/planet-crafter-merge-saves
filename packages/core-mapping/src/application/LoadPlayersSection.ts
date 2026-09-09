import {PlayersPresenterPort} from './ports/PlayersPresenterPort';
import {SaveSectionsReaderPort} from './ports/SaveSectionsReaderPort';

export class LoadPlayersSection {
  constructor(
    private readonly saveParser: SaveSectionsReaderPort,
    private readonly presenter: PlayersPresenterPort,
  ) {}

  async execute(): Promise<void> {
    const players = this.saveParser.getPlayers();
    this.presenter.displayPlayers(players);
  }
}
