import {PlacedWorldObjectEntity} from "../entities/PlacedWorldObjectEntity";
import {WorldObjectEntity} from "../entities/WorldObjectEntity";
import {InventoryEntity} from "../entities/InventoryEntity";
import {
  energyConsumptionLevelsByWorldObjectName,
  energyProductionLevelsByWorldObjectName
} from "../energyLevelsByWorldObjectName";
import {PlanetEnergyLevelsValueObject} from "../valueObjects/PlanetEnergyLevelsValueObject";
import {computeEnergyProductionLevel} from "./computeEnergyProductionLevel";
import {computeEnergyConsumptionLevel} from "./computeEnergyConsumptionLevel";
import {computeEnergyBreakdown} from "./computeEnergyBreakdown";
import {computeOptimizers} from "./computeOptimizers";

/**
 * Computes a single planet's energy levels (production, consumption, breakdowns, optimizer
 * boosts) from its placed world objects. This is the domain rule engine for the game's power
 * system (Rules EN-BASE-*, EN-OPT-*, EN-FUSE-*) — pure computation, no I/O.
 *
 * `allWorldObjects` must contain every world object in the save, positioned or not (Energy Fuses
 * live inside an Optimizer's inventory and are never themselves positioned, so this cannot be
 * limited to positioned/placed objects). `positionedWorldObjectsOnPlanet` must be scoped to the
 * single planet being computed, since each planet has its own independent power grid.
 */
export function computePlanetEnergyLevels(
  allWorldObjects: readonly WorldObjectEntity[],
  positionedWorldObjectsOnPlanet: readonly PlacedWorldObjectEntity[],
  inventories: readonly InventoryEntity[]
): Omit<PlanetEnergyLevelsValueObject, 'planetId'> {
  const production = computeEnergyProductionLevel(allWorldObjects, positionedWorldObjectsOnPlanet, inventories);
  const consumption = computeEnergyConsumptionLevel(positionedWorldObjectsOnPlanet);

  // NOTE: breakdowns use base levels only (no Optimizer/Fuse boost) — see Rule EN-FUSE
  // section in docs/energy-levels.md. Reflecting Optimizer effects in the per-machine
  // breakdown is a follow-up improvement.
  const productionBreakdown = computeEnergyBreakdown(positionedWorldObjectsOnPlanet, energyProductionLevelsByWorldObjectName)
    .map((entry) => ({...entry, productionRatio: production ? entry.totalLevel / production : undefined}));
  const optimizers = computeOptimizers(allWorldObjects, positionedWorldObjectsOnPlanet, inventories)
    .map((optimizer) => ({...optimizer, productionRatio: production ? optimizer.contribution / production : undefined}));

  return {
    production,
    consumption,
    available: production - consumption,
    productionBreakdown,
    consumptionBreakdown: computeEnergyBreakdown(positionedWorldObjectsOnPlanet, energyConsumptionLevelsByWorldObjectName),
    optimizers
  };
}
