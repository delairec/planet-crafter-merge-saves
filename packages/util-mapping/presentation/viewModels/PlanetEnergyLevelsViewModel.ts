import {TableViewModel} from "./TableViewModel";
import {EnergyBreakdownRowViewModel} from "./EnergyBreakdownRowViewModel";
import {OptimizerViewModel} from "./OptimizerViewModel";

export interface PlanetEnergyLevelsViewModel {
  planetId: string;
  energyLevels: TableViewModel;
  productionBreakdown: EnergyBreakdownRowViewModel[];
  consumptionBreakdown: EnergyBreakdownRowViewModel[];
  optimizers: OptimizerViewModel[];
}
