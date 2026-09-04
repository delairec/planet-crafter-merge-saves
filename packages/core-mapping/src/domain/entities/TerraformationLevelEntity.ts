import {assertFiniteNumber, assertNonEmptyString} from "../errors/assertions";

export interface TerraformationLevelEntity {
  readonly planetId: string;
  readonly unitOxygenLevel: number;
  readonly unitHeatLevel: number;
  readonly unitPressureLevel: number;
  readonly unitPlantsLevel: number;
  readonly unitInsectsLevel: number;
  readonly unitAnimalsLevel: number;
  readonly unitPurificationLevel: number;
}

export function createTerraformationLevelEntity(input: TerraformationLevelEntity): TerraformationLevelEntity {
  return {
    planetId: assertNonEmptyString(input.planetId, 'TerraformationLevelEntity.planetId'),
    unitOxygenLevel: assertFiniteNumber(input.unitOxygenLevel, 'TerraformationLevelEntity.unitOxygenLevel'),
    unitHeatLevel: assertFiniteNumber(input.unitHeatLevel, 'TerraformationLevelEntity.unitHeatLevel'),
    unitPressureLevel: assertFiniteNumber(input.unitPressureLevel, 'TerraformationLevelEntity.unitPressureLevel'),
    unitPlantsLevel: assertFiniteNumber(input.unitPlantsLevel, 'TerraformationLevelEntity.unitPlantsLevel'),
    unitInsectsLevel: assertFiniteNumber(input.unitInsectsLevel, 'TerraformationLevelEntity.unitInsectsLevel'),
    unitAnimalsLevel: assertFiniteNumber(input.unitAnimalsLevel, 'TerraformationLevelEntity.unitAnimalsLevel'),
    unitPurificationLevel: assertFiniteNumber(input.unitPurificationLevel, 'TerraformationLevelEntity.unitPurificationLevel')
  };
}
