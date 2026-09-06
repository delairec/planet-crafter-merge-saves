import type {SaveSectionsReaderPort} from './ports/SaveSectionsReaderPort.ts';
import type {GlobalProgressionPresenterPort} from "./ports/GlobalProgressionPresenterPort.ts";

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
