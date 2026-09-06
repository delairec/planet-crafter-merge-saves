import type {WorldObjectEntity} from "../entities/WorldObjectEntity.ts";
import type {PlacedWorldObjectEntity} from "../entities/PlacedWorldObjectEntity.ts";
import type {InventoryEntity} from "../entities/InventoryEntity.ts";
import {assertArray, assertFiniteNumber, assertOptionalString} from "../errors/assertions.ts";

export interface PlanetWorldObjectsValueObject {
  readonly planetId: number;
  readonly planetName?: string;
  readonly placedWorldObjects: readonly PlacedWorldObjectEntity[];
}

export function createPlanetWorldObjectsValueObject(input: PlanetWorldObjectsValueObject): PlanetWorldObjectsValueObject {
  return {
    planetId: assertFiniteNumber(input.planetId, 'PlanetWorldObjectsValueObject.planetId'),
    planetName: assertOptionalString(input.planetName, 'PlanetWorldObjectsValueObject.planetName'),
    placedWorldObjects: assertArray<PlacedWorldObjectEntity>(input.placedWorldObjects, 'PlanetWorldObjectsValueObject.placedWorldObjects')
  };
}

export interface EnergyLevelsRawDataValueObject {
  readonly allWorldObjects: readonly WorldObjectEntity[];
  readonly inventories: readonly InventoryEntity[];
  readonly planets: readonly PlanetWorldObjectsValueObject[];
}

export function createEnergyLevelsRawDataValueObject(input: EnergyLevelsRawDataValueObject): EnergyLevelsRawDataValueObject {
  return {
    allWorldObjects: assertArray<WorldObjectEntity>(input.allWorldObjects, 'EnergyLevelsRawDataValueObject.allWorldObjects'),
    inventories: assertArray<InventoryEntity>(input.inventories, 'EnergyLevelsRawDataValueObject.inventories'),
    planets: assertArray<PlanetWorldObjectsValueObject>(input.planets, 'EnergyLevelsRawDataValueObject.planets')
  };
}
