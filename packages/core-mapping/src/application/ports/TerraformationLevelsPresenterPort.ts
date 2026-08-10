import {TerraformationLevelEntity} from '../../domain/entities/TerraformationLevelEntity';

export interface TerraformationLevelsPresenterPort {
  displayTerraformationLevels(levels: TerraformationLevelEntity[]): void;
}
