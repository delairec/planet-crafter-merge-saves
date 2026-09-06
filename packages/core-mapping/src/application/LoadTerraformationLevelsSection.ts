import type {TerraformationLevelsPresenterPort} from './ports/TerraformationLevelsPresenterPort.ts';
import type {SaveSectionsReaderPort} from "./ports/SaveSectionsReaderPort.ts";
import {createTerraformationLevelSummaryValueObject} from "../domain/valueObjects/TerraformationLevelSummaryValueObject.ts";
import {computeTerraformationSummary} from "../domain/rules/computeTerraformationSummary.ts";

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
