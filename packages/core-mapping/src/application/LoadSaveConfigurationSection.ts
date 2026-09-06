import type {SaveSectionsReaderPort} from "./ports/SaveSectionsReaderPort.ts";
import type {SaveConfigurationPresenterPort} from "./ports/SaveConfigurationPresenterPort.ts";


export class LoadSaveConfigurationSection {
  constructor(
    private readonly saveParser: SaveSectionsReaderPort,
    private readonly presenter: SaveConfigurationPresenterPort
  ) {}

  async execute(): Promise<void> {
    const saveConfiguration = this.saveParser.getSaveConfiguration();
    this.presenter.displaySaveConfiguration(saveConfiguration);
  }
}
