import {EnergyBreakdownEntryValueObject} from "./EnergyBreakdownEntryValueObject";

export interface EnergyLevelsValueObject {
  production: number;
  consumption: number;
  available: number;
  productionBreakdown: EnergyBreakdownEntryValueObject[];
  consumptionBreakdown: EnergyBreakdownEntryValueObject[];
}
