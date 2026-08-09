import {SaveParserPort} from "./ports/SaveParserPort";
import {EnergyLevelsPresenterPort} from "./ports/EnergyLevelsPresenterPort";

export class LoadEnergyLevelsSection {
  constructor(
    private readonly saveParser: SaveParserPort,
    private readonly presenter: EnergyLevelsPresenterPort
  ) {
  }

  execute() {
    const energyLevels = this.saveParser.getEnergyLevels();
    this.presenter.present(energyLevels);
  }
}
