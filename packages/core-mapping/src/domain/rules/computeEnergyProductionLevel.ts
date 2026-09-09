import {PlacedWorldObjectEntity} from "../entities/PlacedWorldObjectEntity";
import {WorldObjectEntity} from "../entities/WorldObjectEntity";
import {InventoryEntity} from "../entities/InventoryEntity";
import {energyProductionLevelsByWorldObjectName} from "../energyLevelsByWorldObjectName";
import {ENERGY_FUSE_MULTIPLIER_PER_FUSE} from "./energyOptimizerConfig";
import {computeEnergyFuseCountsByProducerId} from "./computeEnergyFuseCountsByProducerId";

/**
 * Computes total production for a single planet's positioned world objects (Rule GR-WO-1 /
 * EN-BASE-1: only positioned, i.e. placed, world objects actually produce energy). Each planet
 * has its own independent power grid in-game, so this is always scoped to one planet's objects.
 */
export function computeEnergyProductionLevel(
  allWorldObjects: readonly WorldObjectEntity[],
  positionedWorldObjectsOnPlanet: readonly PlacedWorldObjectEntity[],
  inventories: readonly InventoryEntity[]
): number {
  const fuseCountByProducerId = computeEnergyFuseCountsByProducerId(allWorldObjects, positionedWorldObjectsOnPlanet, inventories);

  return positionedWorldObjectsOnPlanet.reduce((total, worldObject) => {
    const baseLevel = energyProductionLevelsByWorldObjectName[worldObject.name];
    if (baseLevel === undefined) {
      return total;
    }
    const fuseCount = fuseCountByProducerId.get(worldObject.id) ?? 0;
    const multiplier = fuseCount === 0 ? 1 : fuseCount * ENERGY_FUSE_MULTIPLIER_PER_FUSE;
    return total + baseLevel * multiplier;
  }, 0);
}
