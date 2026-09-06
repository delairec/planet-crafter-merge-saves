import {createTerraformationLevelEntity, type TerraformationLevelEntity} from "../entities/TerraformationLevelEntity.ts";
import {assertFiniteNumber} from "../errors/assertions.ts";

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
