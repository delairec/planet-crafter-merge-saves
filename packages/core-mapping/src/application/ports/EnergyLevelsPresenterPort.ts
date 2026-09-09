import {EnergyLevelsValueObject} from "../../domain/valueObjects/EnergyLevelsValueObject";

export interface EnergyLevelsPresenterPort {
  displayEnergyLevels(energyLevels: EnergyLevelsValueObject): void;
}
