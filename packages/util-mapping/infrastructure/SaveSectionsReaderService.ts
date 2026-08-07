import {
  GLOBAL_METADATA_SECTION_INDEX,
  GlobalMetadata,
  Inventory,
  INVENTORIES_SECTION_INDEX,
  ParsedSections,
  Player,
  PLAYERS_SECTION_INDEX,
  SAVE_CONFIGURATION_SECTION_INDEX,
  SaveConfiguration,
  STATISTICS_SECTION_INDEX,
  Statistics,
  TERRAFORMATION_LEVELS_SECTION_INDEX,
  TerraformationLevel,
  WORLD_OBJECTS_SECTION_INDEX,
  WorldObject
} from '../../util-types/gameDefinitions';
import {SaveParserPort} from '../application/ports/SaveParserPort';
import {GlobalProgressionValueObject} from "../domain/valueObjects/GlobalProgressionValueObject";
import {PlayerEntity} from "../domain/entities/PlayerEntity";
import {TerraformationLevelEntity} from '../domain/entities/TerraformationLevelEntity';
import {InventoryEntity} from "../domain/entities/InventoryEntity";
import {WorldObjectEntity} from "../domain/entities/WorldObjectEntity";
import {StatisticsValueObject} from "../domain/valueObjects/StatisticsValueObject";
import {SaveConfigurationValueObject} from "../domain/valueObjects/SaveConfigurationValueObject";
import {EnergyLevelsValueObject} from "../domain/valueObjects/EnergyLevelsValueObject";
import {PlanetEnergyLevelsValueObject} from "../domain/valueObjects/PlanetEnergyLevelsValueObject";
import {worldObjectLabels, WorldObjectName} from "../domain/worldObjectLabels";
import {
  energyConsumptionLevelsByWorldObjectName,
  energyProductionLevelsByWorldObjectName
} from "../domain/energyLevelsByWorldObjectName";
import {EnergyBreakdownEntryValueObject} from "../domain/valueObjects/EnergyBreakdownEntryValueObject";
import {OptimizerValueObject} from "../domain/valueObjects/OptimizerValueObject";
import {planetNamesByNumericId} from "../domain/planetNamesByNumericId";

// Rule EN-OPT-1: Optimizer capacity (max boosted machines) and radius (in meters).
const OPTIMIZER_CONFIG_BY_NAME: Partial<Record<WorldObjectName, {radius: number; maxMachines: number}>> = {
  Optimizer1: {radius: 120, maxMachines: 5},
  Optimizer2: {radius: 250, maxMachines: 8}
};

const ENERGY_FUSE_NAME: WorldObjectName = 'FuseEnergy1' as WorldObjectName;
// Rule EN-FUSE-2/3 (per Fuse wiki page): each Energy Fuse replaces the producer's 100% base value
// with a 150% multiplier; multiple fuses (from one or more Optimizers) stack additively by raw
// percentage — e.g. 2 fuses => 300%, not 200%. A producer reached by zero fuses stays at 100%.
const ENERGY_FUSE_MULTIPLIER_PER_FUSE = 1.5;

function parsePosition(pos: string): [number, number, number] {
  const [x, y, z] = pos.split(',').map(Number);
  return [x, y, z];
}

function distanceBetween(a: [number, number, number], b: [number, number, number]): number {
  return Math.sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2);
}

export class SaveSectionsReaderService implements SaveParserPort {

  private readonly globalMetadata: GlobalMetadata[];
  private readonly terraformationLevels: TerraformationLevel[];
  private readonly players: Player[];
  private readonly worldObjectsFactory: () => Generator<WorldObject>;
  private readonly inventories: Inventory[];
  private readonly statistics: Statistics[];
  private readonly saveConfiguration: SaveConfiguration[];

  constructor(private readonly sections: ParsedSections) {
    this.globalMetadata = sections[GLOBAL_METADATA_SECTION_INDEX] ?? [];
    this.terraformationLevels = sections[TERRAFORMATION_LEVELS_SECTION_INDEX] ?? [];
    this.players = sections[PLAYERS_SECTION_INDEX] ?? [];
    this.worldObjectsFactory = sections[WORLD_OBJECTS_SECTION_INDEX] ?? [];
    this.inventories = sections[INVENTORIES_SECTION_INDEX] ?? [];
    this.statistics = sections[STATISTICS_SECTION_INDEX] ?? [];
    this.saveConfiguration = sections[SAVE_CONFIGURATION_SECTION_INDEX] ?? [];
  }

  getGlobalMetadata(): GlobalProgressionValueObject {
    const metadata = this.globalMetadata[0];

    if (!metadata) {
      return {
        allTimeTerraTokens: 0
      }
    }

    return {
      allTimeTerraTokens: metadata.allTimeTerraTokens
    }
  }

  getPlayers(): PlayerEntity[] {
    const inventories = this.getInventories();

    return this.players.map((player: Player): PlayerEntity => {
      const playerInventory = inventories.find(inventory => inventory.id === player.inventoryId);
      const playerEquipment = inventories.find(inventory => inventory.id === player.equipmentId);

      const playerInventoryIds = playerInventory?.worldObjectIds ?? [];
      const playerEquipmentIds = playerEquipment?.worldObjectIds ?? [];
      const worldObjects = this.findWorldObjectByIds([...playerInventoryIds, ...playerEquipmentIds]);

      return {
        name: player.name,
        inventory: playerInventoryIds.map((id) => worldObjects.find((wo) => wo.id === id)?.name ?? id),
        equipment: playerEquipmentIds.map((id) => worldObjects.find((wo) => wo.id === id)?.name ?? id)
      };
    });
  }

  getTerraformationLevels(): TerraformationLevelEntity[] {
    return this.terraformationLevels.map((level: TerraformationLevel): TerraformationLevelEntity => ({
      planetId: level.planetId,
      unitOxygenLevel: level.unitOxygenLevel,
      unitHeatLevel: level.unitHeatLevel,
      unitPressureLevel: level.unitPressureLevel,
      unitPlantsLevel: level.unitPlantsLevel,
      unitInsectsLevel: level.unitInsectsLevel,
      unitAnimalsLevel: level.unitAnimalsLevel,
      unitPurificationLevel: level.unitPurificationLevel
    }));
  }

  getInventories(): InventoryEntity[] {
    return this.inventories.map((inventory: Inventory): InventoryEntity => ({
      id: inventory.id,
      worldObjectIds: inventory.woIds.split(',').filter(Boolean),
      size: inventory.size
    }));
  }

  getWorldObjects(): (sections: ParsedSections) => Generator<WorldObjectEntity> {

    const worldObjectsFactory = this.worldObjectsFactory;

    return (function* () {
      for (const worldObject of worldObjectsFactory()) {
        yield {
          id: String(worldObject.id),
          name: worldObject.gId as WorldObjectName
        };
      }
    });
  }

  getStatistics(): StatisticsValueObject {
    return this.statistics.map((stat) => ({
      totalCraftedObjects: stat.craftedObjects
    }))[0];
  }

  getSaveConfiguration(): SaveConfigurationValueObject {
    return this.saveConfiguration.map((config) => ({
      title: config.saveDisplayName,
      mode: config.mode,
      modifiers: {
        terraformationPace: config.modifierTerraformationPace,
        powerConsumption: config.modifierPowerConsumption,
        gaugeDrain: config.modifierGaugeDrain,
        meteoOccurrence: config.modifierMeteoOccurence,
        multiplayerFactor: config.modifierMultiplayerTerraformationFactor
      }
    }))[0];
  }

  getEnergyLevels(): EnergyLevelsValueObject {

    // NOTE: production/consumption are scoped per-planet — each planet has its own independent
    // power grid in-game (see docs/energy-levels.md, section 4). Consumption previously
    // under-reported the in-game HUD value because many consumer world objects (water collectors,
    // atmosphere purifiers, detox machines, craft stations, biodomes, etc.) were missing from
    // `energyConsumptionLevelsByWorldObjectName` — see Rule EN-BASE-2.

    const allWorldObjects = [...this.worldObjectsFactory()];
    const positionedWorldObjects = allWorldObjects.filter(
      (worldObject) => worldObject.pos !== undefined && worldObject.planet !== undefined
    );

    const positionedWorldObjectsByPlanet = new Map<number, WorldObject[]>();
    for (const worldObject of positionedWorldObjects) {
      const planetId = worldObject.planet!;
      const worldObjectsOnPlanet = positionedWorldObjectsByPlanet.get(planetId) ?? [];
      worldObjectsOnPlanet.push(worldObject);
      positionedWorldObjectsByPlanet.set(planetId, worldObjectsOnPlanet);
    }

    const planets: PlanetEnergyLevelsValueObject[] = [...positionedWorldObjectsByPlanet.entries()]
      .map(([planetId, positionedWorldObjectsOnPlanet]) => {
        const production = this.computeEnergyProductionLevel(allWorldObjects, positionedWorldObjectsOnPlanet);
        const consumption = this.computeEnergyConsumptionLevel(positionedWorldObjectsOnPlanet);

        return {
          planetId: this.resolvePlanetLabel(planetId, positionedWorldObjectsOnPlanet),
          production,
          consumption,
          available: production - consumption,
          // NOTE: breakdowns use base levels only (no Optimizer/Fuse boost) — see Rule EN-FUSE
          // section in docs/energy-levels.md. Reflecting Optimizer effects in the per-machine
          // breakdown is a follow-up improvement.
          productionBreakdown: this.computeEnergyBreakdown(positionedWorldObjectsOnPlanet, energyProductionLevelsByWorldObjectName),
          consumptionBreakdown: this.computeEnergyBreakdown(positionedWorldObjectsOnPlanet, energyConsumptionLevelsByWorldObjectName),
          optimizers: this.computeOptimizers(allWorldObjects, positionedWorldObjectsOnPlanet),
        };
      });

    return {planets};
  }

  /**
   * Resolves a human-readable label for a numeric `WorldObject.planet` id. The primary source is
   * the fixed lookup table `planetNamesByNumericId` (see docs/save-format.md, "Planet numeric
   * IDs"). For planet ids not in that table (e.g. future planets, modded content), falls back to
   * a heuristic: some world object `gId`s embed the planet name in plain text (e.g. `Seed7Humble`
   * on planet `Humble`) — if exactly one known planet name (from this save's TerraformationLevels)
   * is found as a substring of a `gId` on this planet, use it; otherwise fall back to
   * `Planet ${planetId}`.
   */
  private resolvePlanetLabel(planetId: number, positionedWorldObjectsOnPlanet: WorldObject[]): string {
    const knownPlanetName = planetNamesByNumericId[planetId];
    if (knownPlanetName !== undefined) {
      return knownPlanetName;
    }

    const knownPlanetNames = [...new Set(this.terraformationLevels.map((level) => level.planetId))];

    const matchingPlanetNames = new Set(
      positionedWorldObjectsOnPlanet
        .flatMap((worldObject) => knownPlanetNames.filter((planetName) => worldObject.gId.includes(planetName)))
    );

    return matchingPlanetNames.size === 1 ? [...matchingPlanetNames][0] : `Planet ${planetId}`;
  }

  private findWorldObjectByIds(ids: string[]): WorldObjectEntity[] {
    const result: WorldObjectEntity[] = [];
    for (const worldObject of this.getWorldObjects()(this.sections)) {
      if (ids.includes(worldObject.id)) {
        result.push(worldObject);
      }
    }
    return result;
  }

  /**
   * Computes total production for a single planet's positioned world objects (Rule GR-WO-1 /
   * EN-BASE-1: only positioned, i.e. placed, world objects actually produce energy). Each planet
   * has its own independent power grid in-game, so this is always scoped to one planet's objects.
   */
  private computeEnergyProductionLevel(allWorldObjects: WorldObject[], positionedWorldObjectsOnPlanet: WorldObject[]): number {
    const fuseCountByProducerId = this.computeEnergyFuseCountsByProducerId(allWorldObjects, positionedWorldObjectsOnPlanet);

    return positionedWorldObjectsOnPlanet.reduce((total, worldObject) => {
      const baseLevel = energyProductionLevelsByWorldObjectName[worldObject.gId as WorldObjectName];
      if (baseLevel === undefined) {
        return total;
      }
      const fuseCount = fuseCountByProducerId.get(String(worldObject.id)) ?? 0;
      const multiplier = fuseCount === 0 ? 1 : fuseCount * ENERGY_FUSE_MULTIPLIER_PER_FUSE;
      return total + baseLevel * multiplier;
    }, 0);
  }

  /** Computes total consumption for a single planet's positioned world objects. */
  private computeEnergyConsumptionLevel(positionedWorldObjectsOnPlanet: WorldObject[]): number {
    return positionedWorldObjectsOnPlanet.reduce((total, worldObject) => {
      const kilowatts = energyConsumptionLevelsByWorldObjectName[worldObject.gId as WorldObjectName];
      return kilowatts === undefined ? total : total + kilowatts;
    }, 0);
  }

  /**
   * Groups positioned world objects matching the given base energy levels table by `gId`, so the
   * UI can display, for each machine type, how many are placed and how much it contributes to the
   * total (see the Power section's Production/Consumption breakdowns).
   */
  private computeEnergyBreakdown(
    positionedWorldObjects: WorldObject[],
    levelsByWorldObjectName: Partial<Record<WorldObjectName, number>>
  ): EnergyBreakdownEntryValueObject[] {
    const quantityByName = new Map<WorldObjectName, number>();

    for (const worldObject of positionedWorldObjects) {
      const name = worldObject.gId as WorldObjectName;
      if (levelsByWorldObjectName[name] === undefined) {
        continue;
      }
      quantityByName.set(name, (quantityByName.get(name) ?? 0) + 1);
    }

    return [...quantityByName.entries()]
      .map(([name, quantity]): EnergyBreakdownEntryValueObject => {
        const unitLevel = levelsByWorldObjectName[name]!;
        return {
          label: worldObjectLabels[name],
          quantity,
          unitLevel,
          totalLevel: unitLevel * quantity
        };
      })
      .sort((a, b) => b.totalLevel - a.totalLevel);
  }

  /**
   * Implements rules EN-OPT-1..3 and EN-FUSE-1..4: for each Optimizer holding at least one Energy
   * Fuse, finds the closest eligible energy producers (same planet, within radius, up to the
   * optimizer's machine capacity) reached by that Optimizer.
   */
  private computeOptimizerBoosts(
    allWorldObjects: WorldObject[],
    positionedWorldObjects: WorldObject[]
  ): {optimizer: WorldObject; fuseCount: number; boostedProducers: WorldObject[]}[] {
    const worldObjectById = new Map(allWorldObjects.map((worldObject) => [String(worldObject.id), worldObject]));
    const producers = positionedWorldObjects.filter(
      (worldObject) => energyProductionLevelsByWorldObjectName[worldObject.gId as WorldObjectName] !== undefined
    );
    const optimizers = positionedWorldObjects.filter(
      (worldObject) => OPTIMIZER_CONFIG_BY_NAME[worldObject.gId as WorldObjectName] !== undefined
    );

    const result: {optimizer: WorldObject; fuseCount: number; boostedProducers: WorldObject[]}[] = [];

    for (const optimizer of optimizers) {
      const inventory = this.inventories.find((candidate) => candidate.id === optimizer.liId);
      if (!inventory) {
        continue;
      }

      const fuseCount = inventory.woIds
        .split(',')
        .filter(Boolean)
        .filter((id) => worldObjectById.get(id)?.gId === ENERGY_FUSE_NAME)
        .length;
      if (fuseCount === 0) {
        continue;
      }

      const {radius, maxMachines} = OPTIMIZER_CONFIG_BY_NAME[optimizer.gId as WorldObjectName]!;
      const optimizerPosition = parsePosition(optimizer.pos!);

      const boostedProducers = producers
        .filter((producer) => producer.planet === optimizer.planet)
        .map((producer) => ({producer, distance: distanceBetween(optimizerPosition, parsePosition(producer.pos!))}))
        .filter(({distance}) => distance <= radius)
        .sort((a, b) => a.distance - b.distance)
        .slice(0, maxMachines)
        .map(({producer}) => producer);

      result.push({optimizer, fuseCount, boostedProducers});
    }

    return result;
  }

  /**
   * Implements Rule EN-OPT-3: accumulates the total number of Energy Fuses reaching each producer
   * (summed across every Optimizer that reaches it).
   */
  private computeEnergyFuseCountsByProducerId(
    allWorldObjects: WorldObject[],
    positionedWorldObjects: WorldObject[]
  ): Map<string, number> {
    const fuseCountByProducerId = new Map<string, number>();

    for (const {fuseCount, boostedProducers} of this.computeOptimizerBoosts(allWorldObjects, positionedWorldObjects)) {
      for (const producer of boostedProducers) {
        const producerId = String(producer.id);
        const previousCount = fuseCountByProducerId.get(producerId) ?? 0;
        fuseCountByProducerId.set(producerId, previousCount + fuseCount);
      }
    }

    return fuseCountByProducerId;
  }

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
  private computeOptimizers(
    allWorldObjects: WorldObject[],
    positionedWorldObjects: WorldObject[]
  ): OptimizerValueObject[] {
    const fuseCountByProducerId = this.computeEnergyFuseCountsByProducerId(allWorldObjects, positionedWorldObjects);

    return this.computeOptimizerBoosts(allWorldObjects, positionedWorldObjects)
      .map(({optimizer, fuseCount, boostedProducers}): OptimizerValueObject => {
        const quantityByName = new Map<WorldObjectName, number>();
        let contribution = 0;

        for (const producer of boostedProducers) {
          const name = producer.gId as WorldObjectName;
          quantityByName.set(name, (quantityByName.get(name) ?? 0) + 1);
          const baseLevel = energyProductionLevelsByWorldObjectName[name]!;
          const totalFuseCount = fuseCountByProducerId.get(String(producer.id)) ?? fuseCount;
          const totalBoost = baseLevel * (totalFuseCount * ENERGY_FUSE_MULTIPLIER_PER_FUSE - 1);
          contribution += totalBoost * (fuseCount / totalFuseCount);
        }

        return {
          label: worldObjectLabels[optimizer.gId as WorldObjectName],
          fuseCount,
          boostedMachines: [...quantityByName.entries()].map(([name, quantity]) => ({
            label: worldObjectLabels[name],
            quantity
          })),
          contribution
        };
      });
  }
}
