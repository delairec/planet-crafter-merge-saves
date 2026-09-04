import {EnergyBreakdownEntryValueObject} from "./EnergyBreakdownEntryValueObject";
import {OptimizerValueObject} from "./OptimizerValueObject";
import {assertArray, assertFiniteNumber, assertOptionalString} from "../errors/assertions";

export interface PlanetEnergyLevelsValueObject {
  readonly planetId: number;
  readonly planetName?: string;
  readonly production: number;
  readonly consumption: number;
  readonly available: number;
  readonly productionBreakdown: readonly EnergyBreakdownEntryValueObject[];
  readonly consumptionBreakdown: readonly EnergyBreakdownEntryValueObject[];
  readonly optimizers: readonly OptimizerValueObject[];
}

export function createPlanetEnergyLevelsValueObject(input: PlanetEnergyLevelsValueObject): PlanetEnergyLevelsValueObject {
  return {
    planetId: assertFiniteNumber(input.planetId, 'PlanetEnergyLevelsValueObject.planetId'),
    planetName: assertOptionalString(input.planetName, 'PlanetEnergyLevelsValueObject.planetName'),
    production: assertFiniteNumber(input.production, 'PlanetEnergyLevelsValueObject.production'),
    consumption: assertFiniteNumber(input.consumption, 'PlanetEnergyLevelsValueObject.consumption'),
    available: assertFiniteNumber(input.available, 'PlanetEnergyLevelsValueObject.available'),
    productionBreakdown: assertArray<EnergyBreakdownEntryValueObject>(input.productionBreakdown, 'PlanetEnergyLevelsValueObject.productionBreakdown'),
    consumptionBreakdown: assertArray<EnergyBreakdownEntryValueObject>(input.consumptionBreakdown, 'PlanetEnergyLevelsValueObject.consumptionBreakdown'),
    optimizers: assertArray<OptimizerValueObject>(input.optimizers, 'PlanetEnergyLevelsValueObject.optimizers')
  };
}
