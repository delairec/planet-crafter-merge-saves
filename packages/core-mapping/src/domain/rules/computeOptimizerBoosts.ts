import type {PlacedWorldObjectEntity} from "../entities/PlacedWorldObjectEntity.ts";
import type {WorldObjectEntity} from "../entities/WorldObjectEntity.ts";
import type {InventoryEntity} from "../entities/InventoryEntity.ts";
import {distanceBetween} from "./distanceBetween.ts";
import {ENERGY_FUSE_NAME, OPTIMIZER_CONFIG_BY_NAME} from "./energyOptimizerConfig.ts";
import {energyProductionLevelsByWorldObjectName} from "../energyLevelsByWorldObjectName.ts";

/**
 * Implements rules EN-OPT-1..3 and EN-FUSE-1..4: for each Optimizer holding at least one Energy
 * Fuse, finds the closest eligible energy producers (same planet, within radius, up to the
 * optimizer's machine capacity) reached by that Optimizer.
 */
export function computeOptimizerBoosts(
  allWorldObjects: readonly WorldObjectEntity[],
  positionedWorldObjects: readonly PlacedWorldObjectEntity[],
  inventories: readonly InventoryEntity[]
): { optimizer: PlacedWorldObjectEntity; fuseCount: number; boostedProducers: PlacedWorldObjectEntity[] }[] {
  const worldObjectById = new Map(allWorldObjects.map((worldObject) => [worldObject.id, worldObject]));
  const producers = positionedWorldObjects.filter(
    (worldObject) => energyProductionLevelsByWorldObjectName[worldObject.name] !== undefined
  );
  const optimizers = positionedWorldObjects.filter(
    (worldObject) => OPTIMIZER_CONFIG_BY_NAME[worldObject.name] !== undefined
  );

  const result: {
    optimizer: PlacedWorldObjectEntity;
    fuseCount: number;
    boostedProducers: PlacedWorldObjectEntity[]
  }[] = [];

  for (const optimizer of optimizers) {
    const inventory = inventories.find((candidate) => candidate.id === optimizer.inventoryId);
    if (!inventory) {
      continue;
    }

    const fuseCount = inventory.worldObjectIds
      .filter((id) => worldObjectById.get(id)?.name === ENERGY_FUSE_NAME)
      .length;
    if (fuseCount === 0) {
      continue;
    }

    const {radius, maxMachines} = OPTIMIZER_CONFIG_BY_NAME[optimizer.name]!;

    const boostedProducers = producers
      .filter((producer) => producer.planetId === optimizer.planetId)
      .map((producer) => ({producer, distance: distanceBetween(optimizer.position, producer.position)}))
      .filter(({distance}) => distance <= radius)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, maxMachines)
      .map(({producer}) => producer);

    result.push({optimizer, fuseCount, boostedProducers});
  }

  return result;
}
