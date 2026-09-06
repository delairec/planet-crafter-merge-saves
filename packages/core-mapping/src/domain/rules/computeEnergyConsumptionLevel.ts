import type {PlacedWorldObjectEntity} from "../entities/PlacedWorldObjectEntity.ts";
import {energyConsumptionLevelsByWorldObjectName} from "../energyLevelsByWorldObjectName.ts";

/** Computes total consumption for a single planet's positioned world objects. */
export function computeEnergyConsumptionLevel(positionedWorldObjectsOnPlanet: readonly PlacedWorldObjectEntity[]): number {
  return positionedWorldObjectsOnPlanet.reduce((total, worldObject) => {
    const kilowatts = energyConsumptionLevelsByWorldObjectName[worldObject.name];
    return kilowatts === undefined ? total : total + kilowatts;
  }, 0);
}
