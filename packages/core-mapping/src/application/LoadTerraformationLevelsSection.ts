import {TerraformationLevelsPresenterPort} from './ports/TerraformationLevelsPresenterPort';
import {SaveSectionsReaderPort} from "./ports/SaveSectionsReaderPort";
import {createTerraformationLevelSummaryValueObject} from "../domain/valueObjects/TerraformationLevelSummaryValueObject";
import {computeTerraformationSummary} from "../domain/rules/computeTerraformationSummary";

export class LoadTerraformationLevelsSection {
  constructor(
    private saveParser: SaveSectionsReaderPort,
    private presenter: TerraformationLevelsPresenterPort
  ) {}

  async execute(): Promise<void> {
    const levels = this.saveParser.getTerraformationLevels();
    const levelsWithSummary = levels.map((level) => createTerraformationLevelSummaryValueObject({
      ...level,
      ...computeTerraformationSummary(level)
    }));

    this.presenter.displayTerraformationLevels(levelsWithSummary);
  }
}
