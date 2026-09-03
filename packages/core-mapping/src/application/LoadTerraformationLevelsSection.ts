import {TerraformationLevelsPresenterPort} from './ports/TerraformationLevelsPresenterPort';
import {SaveSectionsReaderPort} from "./ports/SaveSectionsReaderPort";

export class LoadTerraformationLevelsSection {
  constructor(
    private saveParser: SaveSectionsReaderPort,
    private presenter: TerraformationLevelsPresenterPort
  ) {}

  execute(): void {
    const levels = this.saveParser.getTerraformationLevels();
    this.presenter.displayTerraformationLevels(levels);
  }
}
