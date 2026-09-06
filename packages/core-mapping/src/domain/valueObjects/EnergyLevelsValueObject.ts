import type {PlanetEnergyLevelsValueObject} from "./PlanetEnergyLevelsValueObject.ts";
import {assertArray} from "../errors/assertions.ts";

export interface EnergyLevelsValueObject {
  readonly planets: readonly PlanetEnergyLevelsValueObject[];
}

export function createEnergyLevelsValueObject(input: EnergyLevelsValueObject): EnergyLevelsValueObject {
  return {
    planets: assertArray<PlanetEnergyLevelsValueObject>(input.planets, 'EnergyLevelsValueObject.planets')
  };
}
