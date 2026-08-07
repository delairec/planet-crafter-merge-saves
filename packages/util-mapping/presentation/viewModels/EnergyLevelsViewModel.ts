import {TableViewModel} from "./TableViewModel";
import {EnergyBreakdownRowViewModel} from "./EnergyBreakdownRowViewModel";

export interface EnergyLevelsViewModel {
  energyLevels: TableViewModel;
  balanceInsight: string;
  productionBreakdown: EnergyBreakdownRowViewModel[];
  consumptionBreakdown: EnergyBreakdownRowViewModel[];
}
