import {EnergyLevelsValueObject} from "../../domain/valueObjects/EnergyLevelsValueObject";

export interface EnergyLevelsPresenterPort {
  present(energyLevels: EnergyLevelsValueObject): void;
}
