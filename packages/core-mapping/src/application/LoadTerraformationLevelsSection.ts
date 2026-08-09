import {TerraformationLevelsPresenterPort} from './ports/TerraformationLevelsPresenterPort';
import {SaveParserPort} from "./ports/SaveParserPort";

export class LoadTerraformationLevelsSection {
  constructor(
    private saveParser: SaveParserPort,
    private presenter: TerraformationLevelsPresenterPort
  ) {}

  execute(): void {
    const levels = this.saveParser.getTerraformationLevels();
    this.presenter.present(levels);
  }
}
