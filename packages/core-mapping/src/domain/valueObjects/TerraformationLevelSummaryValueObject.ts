import {TerraformationLevelEntity} from "../entities/TerraformationLevelEntity";

export interface TerraformationLevelSummaryValueObject extends TerraformationLevelEntity {
  terraformationIndex: number;
  biomass: number;
}
