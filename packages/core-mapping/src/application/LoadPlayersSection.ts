import type {PlayersPresenterPort} from './ports/PlayersPresenterPort.ts';
import type {SaveSectionsReaderPort} from './ports/SaveSectionsReaderPort.ts';

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
