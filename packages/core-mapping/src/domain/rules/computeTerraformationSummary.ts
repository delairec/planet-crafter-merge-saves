import type {TerraformationLevelEntity} from "../entities/TerraformationLevelEntity.ts";

export interface TerraformationSummary {
  terraformationIndex: number;
  biomass: number;
}

/** Computes the terraformation index and biomass derived from a planet's unit levels. */
export function computeTerraformationSummary(level: TerraformationLevelEntity): TerraformationSummary {
  const biomass = level.unitPlantsLevel + level.unitInsectsLevel + level.unitAnimalsLevel;
  const environmental = level.unitOxygenLevel + level.unitHeatLevel + level.unitPressureLevel + level.unitPurificationLevel;

  return {
    terraformationIndex: environmental + biomass,
    biomass
  };
}
