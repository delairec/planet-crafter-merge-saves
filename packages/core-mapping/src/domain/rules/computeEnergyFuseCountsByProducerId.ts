import type {PlacedWorldObjectEntity} from "../entities/PlacedWorldObjectEntity.ts";
import type {WorldObjectEntity} from "../entities/WorldObjectEntity.ts";
import type {InventoryEntity} from "../entities/InventoryEntity.ts";
import {computeOptimizerBoosts} from "./computeOptimizerBoosts.ts";

/**
 * Implements Rule EN-OPT-3: accumulates the total number of Energy Fuses reaching each producer
 * (summed across every Optimizer that reaches it).
 */
export function computeEnergyFuseCountsByProducerId(
  allWorldObjects: readonly WorldObjectEntity[],
  positionedWorldObjects: readonly PlacedWorldObjectEntity[],
  inventories: readonly InventoryEntity[]
): Map<string, number> {
  const fuseCountByProducerId = new Map<string, number>();

  for (const {
    fuseCount,
    boostedProducers
  } of computeOptimizerBoosts(allWorldObjects, positionedWorldObjects, inventories)) {
    for (const producer of boostedProducers) {
      const previousCount = fuseCountByProducerId.get(producer.id) ?? 0;
      fuseCountByProducerId.set(producer.id, previousCount + fuseCount);
    }
  }

  return fuseCountByProducerId;
}
