import {EnergyBreakdownEntryValueObject} from "./EnergyBreakdownEntryValueObject";
import {OptimizerValueObject} from "./OptimizerValueObject";

export interface EnergyLevelsValueObject {
  production: number;
  consumption: number;
  available: number;
  productionBreakdown: EnergyBreakdownEntryValueObject[];
  consumptionBreakdown: EnergyBreakdownEntryValueObject[];
  optimizers: OptimizerValueObject[];
}
