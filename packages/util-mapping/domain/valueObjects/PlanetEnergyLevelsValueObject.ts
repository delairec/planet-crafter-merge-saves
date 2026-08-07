import {EnergyBreakdownEntryValueObject} from "./EnergyBreakdownEntryValueObject";
import {OptimizerValueObject} from "./OptimizerValueObject";

export interface PlanetEnergyLevelsValueObject {
  planetId: string;
  production: number;
  consumption: number;
  available: number;
  productionBreakdown: EnergyBreakdownEntryValueObject[];
  consumptionBreakdown: EnergyBreakdownEntryValueObject[];
  optimizers: OptimizerValueObject[];
}
