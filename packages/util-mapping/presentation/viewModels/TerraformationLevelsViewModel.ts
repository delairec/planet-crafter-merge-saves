import {TableViewModel} from "./TableViewModel";

export interface TerraformationLevelsViewModel {
  planets: PlanetLevelsViewModel[]
}

interface PlanetLevelsViewModel {
  name: string;
  environmentalLevels: TableViewModel;
  organicLevels: TableViewModel;
  terraformationIndex: string;
  biomass: string;
}
