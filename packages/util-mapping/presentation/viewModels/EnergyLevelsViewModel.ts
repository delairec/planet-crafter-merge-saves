import {TableViewModel} from "./TableViewModel";
import {EnergyBreakdownRowViewModel} from "./EnergyBreakdownRowViewModel";
import {OptimizerViewModel} from "./OptimizerViewModel";

export interface EnergyLevelsViewModel {
  energyLevels: TableViewModel;
  balanceInsight: string;
  productionBreakdown: EnergyBreakdownRowViewModel[];
  consumptionBreakdown: EnergyBreakdownRowViewModel[];
  optimizers: OptimizerViewModel[];
}
