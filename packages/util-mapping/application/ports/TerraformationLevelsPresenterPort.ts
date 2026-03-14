import {TerraformationLevelEntity} from '../../domain/TerraformationLevelEntity';

export interface TerraformationLevelsPresenterPort {
  present(levels: TerraformationLevelEntity[]): void;
}

