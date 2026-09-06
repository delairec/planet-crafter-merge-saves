import type {TableViewModel} from "./TableViewModel.ts";
import type {EnergyBreakdownRowViewModel} from "./EnergyBreakdownRowViewModel.ts";
import type {OptimizerViewModel} from "./OptimizerViewModel.ts";

export interface PlanetEnergyLevelsViewModel {
  planetId: string;
  energyLevels: TableViewModel;
  productionBreakdown: EnergyBreakdownRowViewModel[];
  consumptionBreakdown: EnergyBreakdownRowViewModel[];
  optimizers: OptimizerViewModel[];
}
