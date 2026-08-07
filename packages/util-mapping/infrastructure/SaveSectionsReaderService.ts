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
import {WorldObjectName} from "../domain/worldObjectLabels";
import {
  energyConsumptionLevelsByWorldObjectName,
  energyProductionLevelsByWorldObjectName
} from "../domain/energyLevelsByWorldObjectName";

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

    // NOTE: consumption previously under-reported the in-game HUD value because many consumer
    // world objects (water collectors, atmosphere purifiers, detox machines, craft stations,
    // biodomes, etc.) were missing from `energyConsumptionLevelsByWorldObjectName` — see Rule
    // EN-BASE-2 in docs/energy-levels.md. Still open: whether production/consumption should be
    // scoped per-planet rather than global across the whole save.

    const production = this.computeEnergyProductionLevel();
    const consumption = this.computeEnergyConsumptionLevel();
    const available = production - consumption;

    return {
      production,
      consumption,
      available,
    };
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

  private computeEnergyProductionLevel(): number {
    const allWorldObjects = [...this.worldObjectsFactory()];
    // Rule GR-WO-1 / EN-BASE-1: only positioned (placed) world objects actually produce energy.
    const positionedWorldObjects = allWorldObjects.filter(
      (worldObject) => worldObject.pos !== undefined && worldObject.planet !== undefined
    );
    const fuseCountByProducerId = this.computeEnergyFuseCountsByProducerId(allWorldObjects, positionedWorldObjects);

    return positionedWorldObjects.reduce((total, worldObject) => {
      const baseLevel = energyProductionLevelsByWorldObjectName[worldObject.gId as WorldObjectName];
      if (baseLevel === undefined) {
        return total;
      }
      const fuseCount = fuseCountByProducerId.get(String(worldObject.id)) ?? 0;
      const multiplier = fuseCount === 0 ? 1 : fuseCount * ENERGY_FUSE_MULTIPLIER_PER_FUSE;
      return total + baseLevel * multiplier;
    }, 0);
  }

  private computeEnergyConsumptionLevel(): number {
    return [...this.worldObjectsFactory()].reduce((total, worldObject) => {
      if (worldObject.pos === undefined || worldObject.planet === undefined) {
        return total;
      }
      const kilowatts = energyConsumptionLevelsByWorldObjectName[worldObject.gId as WorldObjectName];
      return kilowatts === undefined ? total : total + kilowatts;
    }, 0);
  }

  /**
   * Implements rules EN-OPT-1..3 and EN-FUSE-1..4: for each Optimizer holding at least one Energy
   * Fuse, finds the closest eligible energy producers (same planet, within radius, up to the
   * optimizer's machine capacity) and accumulates the total number of Energy Fuses reaching each
   * producer (summed across every optimizer that reaches it, per Rule EN-OPT-3).
   */
  private computeEnergyFuseCountsByProducerId(
    allWorldObjects: WorldObject[],
    positionedWorldObjects: WorldObject[]
  ): Map<string, number> {
    const fuseCountByProducerId = new Map<string, number>();

    const worldObjectById = new Map(allWorldObjects.map((worldObject) => [String(worldObject.id), worldObject]));
    const producers = positionedWorldObjects.filter(
      (worldObject) => energyProductionLevelsByWorldObjectName[worldObject.gId as WorldObjectName] !== undefined
    );
    const optimizers = positionedWorldObjects.filter(
      (worldObject) => OPTIMIZER_CONFIG_BY_NAME[worldObject.gId as WorldObjectName] !== undefined
    );

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

      const closestEligibleProducers = producers
        .filter((producer) => producer.planet === optimizer.planet)
        .map((producer) => ({producer, distance: distanceBetween(optimizerPosition, parsePosition(producer.pos!))}))
        .filter(({distance}) => distance <= radius)
        .sort((a, b) => a.distance - b.distance)
        .slice(0, maxMachines);

      for (const {producer} of closestEligibleProducers) {
        const producerId = String(producer.id);
        const previousCount = fuseCountByProducerId.get(producerId) ?? 0;
        fuseCountByProducerId.set(producerId, previousCount + fuseCount);
      }
    }

    return fuseCountByProducerId;
  }
}
