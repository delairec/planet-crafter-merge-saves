import {SaveSectionsReaderPort} from './ports/SaveSectionsReaderPort';
import {GlobalProgressionPresenterPort} from "./ports/GlobalProgressionPresenterPort";

export class LoadGlobalProgressionSection {
  constructor(
    private readonly saveParser: SaveSectionsReaderPort,
    private readonly presenter: GlobalProgressionPresenterPort,
  ) {}

  async execute(): Promise<void> {
    const globalProgression = this.saveParser.getGlobalMetadata();
    const statistics = this.saveParser.getStatistics();
    this.presenter.displayGlobalProgression(globalProgression, statistics);
  }
}
