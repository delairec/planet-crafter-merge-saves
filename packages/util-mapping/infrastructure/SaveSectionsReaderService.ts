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

    // FIXME: il doit manquer des unités car le compte n'y est pas (inférieur au cas réel)
    //  + voir si c'est une production par planète ou globale ?

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
    return this.sumEnergyLevelByNames([
      ['EnergyGenerator1', 1.2],
      ['WindTurbine1', 290],
      ['EnergyGenerator2', 6.5],
      ['EnergyGenerator3', 19.5],
      ['EnergyGenerator4', 86.5],
      ['EnergyGenerator5', 331.5],
      ['EnergyGenerator6', 1485.5]
    ]);
  }

  private computeEnergyConsumptionLevel(): number {
    return this.sumEnergyLevelByNames([
      ['Drill0', 0.5],
      ['Drill1', 5],
      ['Drill2', 8.5],
      ['Drill3', 45.5],
      ['Heater1', 1],
      ['Heater2', 3.5],
      ['Heater3', 17.5],
      ['Heater4', 51.5],
      ['Heater5', 360.5],
      ['OreExtractor1', 34],
      ['OreExtractor2', 164],
      ['GasExtractor1', 58],
      ['GasExtractor2', 218],
      ['GrassSpreader1', 13.8],
      ['SeedSpreader1', 28.8],
      ['SeedSpreader2', 38.8],
      ['TreeSpreader0', 31],
      ['TreeSpreader1', 71],
      ['TreeSpreader2', 153],
      ['ComAntenna', 15],
      ['Teleporter1', 276],
      ['RecyclingMachine', 12.5],
      ['RecyclingMachine2', 283],
      ['Destructor1', 18]
    ]);
  }

  private sumEnergyLevelByNames(kilowattsByName: [WorldObjectName, number][]): number {
    return kilowattsByName.reduce(
      (total, [name, kilowatts]) => total + this.findWorldObjectsByNames([name]).length * kilowatts,
      0
    );
  }
}
