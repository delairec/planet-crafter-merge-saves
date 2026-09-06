import type {TerraformationLevelSummaryValueObject} from '../../domain/valueObjects/TerraformationLevelSummaryValueObject.ts';

export interface TerraformationLevelsPresenterPort {
  displayTerraformationLevels(levels: TerraformationLevelSummaryValueObject[]): void;
}
