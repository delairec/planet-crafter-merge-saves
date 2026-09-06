import type {WorldObjectName} from "../worldObjectNames.ts";
import type {PlacedWorldObjectEntity} from "../entities/PlacedWorldObjectEntity.ts";
import type {WorldObjectEntity} from "../entities/WorldObjectEntity.ts";
import type {InventoryEntity} from "../entities/InventoryEntity.ts";
import {type OptimizerValueObject, createOptimizerValueObject} from "../valueObjects/OptimizerValueObject.ts";
import {createOptimizerBoostedMachineValueObject} from "../valueObjects/OptimizerBoostedMachineValueObject.ts";
import {energyProductionLevelsByWorldObjectName} from "../energyLevelsByWorldObjectName.ts";
import {ENERGY_FUSE_MULTIPLIER_PER_FUSE} from "./energyOptimizerConfig.ts";
import {computeOptimizerBoosts} from "./computeOptimizerBoosts.ts";
import {computeEnergyFuseCountsByProducerId} from "./computeEnergyFuseCountsByProducerId.ts";

/**
 * Builds one entry per Optimizer holding at least one Energy Fuse, describing which machines it
 * boosts and its own contribution to production. Contribution is the extra production gained
 * from the boost only (boosted level minus base level), since the base level is already counted
 * in the production breakdown — avoids double-counting when computing each entry's share of
 * total production. When several Optimizers reach the same producer (Rule EN-OPT-3), the
 * producer's total boost is split between them in proportion to each Optimizer's fuse count, so
 * that contributions sum up to the producer's actual combined boost instead of each Optimizer's
 * fuse applied in isolation.
 */
export function computeOptimizers(
  allWorldObjects: readonly WorldObjectEntity[],
  positionedWorldObjects: readonly PlacedWorldObjectEntity[],
  inventories: readonly InventoryEntity[]
): OptimizerValueObject[] {
  const fuseCountByProducerId = computeEnergyFuseCountsByProducerId(allWorldObjects, positionedWorldObjects, inventories);

  return computeOptimizerBoosts(allWorldObjects, positionedWorldObjects, inventories)
    .map(({optimizer, fuseCount, boostedProducers}): OptimizerValueObject => {
      const quantityByName = new Map<WorldObjectName, number>();
      let contribution = 0;

      for (const producer of boostedProducers) {
        quantityByName.set(producer.name, (quantityByName.get(producer.name) ?? 0) + 1);
        const baseLevel = energyProductionLevelsByWorldObjectName[producer.name]!;
        const totalFuseCount = fuseCountByProducerId.get(producer.id) ?? fuseCount;
        if (totalFuseCount === 0) {
          continue;
        }
        const totalBoost = baseLevel * (totalFuseCount * ENERGY_FUSE_MULTIPLIER_PER_FUSE - 1);
        contribution += totalBoost * (fuseCount / totalFuseCount);
      }

      return createOptimizerValueObject({
        name: optimizer.name,
        fuseCount,
        boostedMachines: [...quantityByName.entries()].map(([name, quantity]) => createOptimizerBoostedMachineValueObject({
          name,
          quantity
        })),
        contribution
      });
    });
}
