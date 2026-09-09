import {TerraformationLevelSummaryValueObject} from '../../domain/valueObjects/TerraformationLevelSummaryValueObject';

export interface TerraformationLevelsPresenterPort {
  displayTerraformationLevels(levels: TerraformationLevelSummaryValueObject[]): void;
}
