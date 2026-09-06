import type {EnergyLevelsValueObject} from "../../domain/valueObjects/EnergyLevelsValueObject.ts";

export interface EnergyLevelsPresenterPort {
  displayEnergyLevels(energyLevels: EnergyLevelsValueObject): void;
}
