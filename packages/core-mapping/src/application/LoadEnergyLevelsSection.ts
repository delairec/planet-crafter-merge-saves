import {SaveSectionsReaderPort} from "./ports/SaveSectionsReaderPort";
import {EnergyLevelsPresenterPort} from "./ports/EnergyLevelsPresenterPort";

export class LoadEnergyLevelsSection {
  constructor(
    private readonly saveParser: SaveSectionsReaderPort,
    private readonly presenter: EnergyLevelsPresenterPort
  ) {
  }

  execute() {
    const energyLevels = this.saveParser.getEnergyLevels();
    this.presenter.displayEnergyLevels(energyLevels);
  }
}
