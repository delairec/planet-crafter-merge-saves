import {SaveSectionsReaderPort} from "./ports/SaveSectionsReaderPort";
import {SaveConfigurationPresenterPort} from "./ports/SaveConfigurationPresenterPort";


export class LoadSaveConfigurationSection {
  constructor(
    private readonly saveParser: SaveSectionsReaderPort,
    private readonly presenter: SaveConfigurationPresenterPort
  ) {}

  execute(): void {
    const saveConfiguration = this.saveParser.getSaveConfiguration();
    this.presenter.displaySaveConfiguration(saveConfiguration);
  }
}
