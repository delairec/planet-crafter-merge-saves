import {TerraformationLevelEntity} from '../../domain/entities/TerraformationLevelEntity';

export interface TerraformationLevelsPresenterPort {
  present(levels: TerraformationLevelEntity[]): void;
}

