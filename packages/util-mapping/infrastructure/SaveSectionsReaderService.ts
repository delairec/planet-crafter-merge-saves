import {
  GLOBAL_METADATA_SECTION_INDEX,
  INVENTORIES_SECTION_INDEX,
  ParsedSections,
  Player,
  PLAYERS_SECTION_INDEX,
  SAVE_CONFIGURATION_SECTION_INDEX,
  STATISTICS_SECTION_INDEX,
  TERRAFORMATION_LEVELS_SECTION_INDEX,
  TerraformationLevel,
  WORLD_OBJECTS_SECTION_INDEX
} from '../../util-types/gameDefinitions';
import {SaveParserPort} from '../application/ports/SaveParserPort';
import {GlobalProgressionValueObject} from "../domain/valueObjects/GlobalProgressionValueObject";
import {PlayerEntity} from "../domain/entities/PlayerEntity";
import {TerraformationLevelEntity} from '../domain/entities/TerraformationLevelEntity';
import {InventoryEntity} from "../domain/entities/InventoryEntity";
import {Inventory} from "../../util-types/gameDefinitions/Inventory";
import {WorldObjectEntity} from "../domain/entities/WorldObjectEntity";
import {StatisticsValueObject} from "../domain/valueObjects/StatisticsValueObject";
import {SaveConfigurationValueObject} from "../domain/valueObjects/SaveConfigurationValueObject";
import {EnergyLevelsValueObject} from "../domain/valueObjects/EnergyLevelsValueObject";
import {WorldObjectName} from "../domain/worldObjectLabels";

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

  private findWorldObjectsByNames(names: WorldObjectName[]): WorldObjectEntity[] {
    const result: WorldObjectEntity[] = [];
    for (const worldObject of this.getWorldObjects()(this.sections)) {
      if (names.includes(worldObject.name)) {
        result.push(worldObject);
      }
    }
    return result;
  }

  private computeEnergyProductionLevel(): number {
    const windTurbines: WorldObjectEntity[] = this.findWorldObjectsByNames(['EnergyGenerator1']);
    const t2WindTurbines: WorldObjectEntity[] = this.findWorldObjectsByNames(['WindTurbine1']);
    const t1SolarPanels: WorldObjectEntity[] = this.findWorldObjectsByNames(['EnergyGenerator2']);
    const t2SolarPanels: WorldObjectEntity[] = this.findWorldObjectsByNames(['EnergyGenerator3']);
    const t1NuclearReactors: WorldObjectEntity[] = this.findWorldObjectsByNames(['EnergyGenerator4']);
    const t2NuclearReactors: WorldObjectEntity[] = this.findWorldObjectsByNames(['EnergyGenerator5']);
    const nuclearFusionGenerators: WorldObjectEntity[] = this.findWorldObjectsByNames(['EnergyGenerator6']);

    return windTurbines.length * 1.2 +
      t2WindTurbines.length * 290 +
      t1SolarPanels.length * 6.5 +
      t2SolarPanels.length * 19.5 +
      t1NuclearReactors.length * 86.5 +
      t2NuclearReactors.length * 331.5 +
      nuclearFusionGenerators.length * 1485.5;
  }

  private computeEnergyConsumptionLevel():number {
    return 0;
  }
}
