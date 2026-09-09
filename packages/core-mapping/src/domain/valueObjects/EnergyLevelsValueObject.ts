import {PlanetEnergyLevelsValueObject} from "./PlanetEnergyLevelsValueObject";
import {assertArray} from "../errors/assertions";

export interface EnergyLevelsValueObject {
  readonly planets: readonly PlanetEnergyLevelsValueObject[];
}

export function createEnergyLevelsValueObject(input: EnergyLevelsValueObject): EnergyLevelsValueObject {
  return {
    planets: assertArray<PlanetEnergyLevelsValueObject>(input.planets, 'EnergyLevelsValueObject.planets')
  };
}
