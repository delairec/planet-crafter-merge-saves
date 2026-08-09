import {SaveParserPort} from "./ports/SaveParserPort";
import {SaveConfigurationPresenterPort} from "./ports/SaveConfigurationPresenterPort";


export class LoadSaveConfigurationSection {
  constructor(
    private readonly saveParser: SaveParserPort,
    private readonly presenter: SaveConfigurationPresenterPort
  ) {}

  execute(): void {
    const saveConfiguration = this.saveParser.getSaveConfiguration();
    this.presenter.present(saveConfiguration);
  }
}
