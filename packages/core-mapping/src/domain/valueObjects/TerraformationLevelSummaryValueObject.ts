import {createTerraformationLevelEntity, TerraformationLevelEntity} from "../entities/TerraformationLevelEntity";
import {assertFiniteNumber} from "../errors/assertions";

export interface TerraformationLevelSummaryValueObject extends TerraformationLevelEntity {
  readonly terraformationIndex: number;
  readonly biomass: number;
}

export function createTerraformationLevelSummaryValueObject(input: TerraformationLevelSummaryValueObject): TerraformationLevelSummaryValueObject {
  return {
    ...createTerraformationLevelEntity(input),
    terraformationIndex: assertFiniteNumber(input.terraformationIndex, 'TerraformationLevelSummaryValueObject.terraformationIndex'),
    biomass: assertFiniteNumber(input.biomass, 'TerraformationLevelSummaryValueObject.biomass')
  };
}
