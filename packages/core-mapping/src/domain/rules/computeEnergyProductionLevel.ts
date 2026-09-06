import type {PlacedWorldObjectEntity} from "../entities/PlacedWorldObjectEntity.ts";
import type {WorldObjectEntity} from "../entities/WorldObjectEntity.ts";
import type {InventoryEntity} from "../entities/InventoryEntity.ts";
import {energyProductionLevelsByWorldObjectName} from "../energyLevelsByWorldObjectName.ts";
import {ENERGY_FUSE_MULTIPLIER_PER_FUSE} from "./energyOptimizerConfig.ts";
import {computeEnergyFuseCountsByProducerId} from "./computeEnergyFuseCountsByProducerId.ts";

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
