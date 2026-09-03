import {WorldObjectEntity} from "../entities/WorldObjectEntity";
import {PlacedWorldObjectEntity} from "../entities/PlacedWorldObjectEntity";
import {InventoryEntity} from "../entities/InventoryEntity";

export interface PlanetWorldObjectsValueObject {
  planetId: number;
  planetName?: string;
  placedWorldObjects: PlacedWorldObjectEntity[];
}

export interface EnergyLevelsRawDataValueObject {
  allWorldObjects: WorldObjectEntity[];
  inventories: InventoryEntity[];
  planets: PlanetWorldObjectsValueObject[];
}
