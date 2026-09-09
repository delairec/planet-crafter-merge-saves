import {PlacedWorldObjectEntity} from "../entities/PlacedWorldObjectEntity";
import {WorldObjectEntity} from "../entities/WorldObjectEntity";
import {InventoryEntity} from "../entities/InventoryEntity";
import {computeOptimizerBoosts} from "./computeOptimizerBoosts";

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
