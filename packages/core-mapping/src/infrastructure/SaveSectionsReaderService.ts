import {
  GLOBAL_METADATA_SECTION_INDEX,
  GlobalMetadata,
  INVENTORIES_SECTION_INDEX,
  Inventory,
  ParsedSections,
  Player,
  PLAYERS_SECTION_INDEX,
  SAVE_CONFIGURATION_SECTION_INDEX,
  SaveConfiguration,
  Statistics,
  STATISTICS_SECTION_INDEX,
  TERRAFORMATION_LEVELS_SECTION_INDEX,
  TerraformationLevel,
  WORLD_OBJECTS_SECTION_INDEX,
  WorldObject
} from 'shared-save-processing/gameDefinitions';
import {SaveSectionsReaderPort} from '../application/ports/SaveSectionsReaderPort';
import {GlobalProgressionValueObject, createGlobalProgressionValueObject} from "../domain/valueObjects/GlobalProgressionValueObject";
import {PlayerEntity, createPlayerEntity} from "../domain/entities/PlayerEntity";
import {TerraformationLevelEntity, createTerraformationLevelEntity} from '../domain/entities/TerraformationLevelEntity';
import {InventoryEntity, createInventoryEntity} from "../domain/entities/InventoryEntity";
import {WorldObjectEntity, createWorldObjectEntity} from "../domain/entities/WorldObjectEntity";
import {PlacedWorldObjectEntity, createPlacedWorldObjectEntity} from "../domain/entities/PlacedWorldObjectEntity";
import {StatisticsValueObject, createStatisticsValueObject} from "../domain/valueObjects/StatisticsValueObject";
import {SaveConfigurationValueObject, createSaveConfigurationValueObject} from "../domain/valueObjects/SaveConfigurationValueObject";
import {
  EnergyLevelsRawDataValueObject,
  PlanetWorldObjectsValueObject,
  createEnergyLevelsRawDataValueObject,
  createPlanetWorldObjectsValueObject
} from "../domain/valueObjects/EnergyLevelsRawDataValueObject";
import {WorldObjectName} from "../domain/worldObjectNames";
import {resolvePlanetName} from "../domain/rules/resolvePlanetName";

function parsePosition(pos: string): [number, number, number] {
  const [x, y, z] = pos.split(',').map(Number);
  return [x, y, z];
}

export class SaveSectionsReaderService implements SaveSectionsReaderPort {

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
      return createGlobalProgressionValueObject({
        allTimeTerraTokens: 0
      });
    }

    return createGlobalProgressionValueObject({
      allTimeTerraTokens: metadata.allTimeTerraTokens
    });
  }

  getPlayers(): PlayerEntity[] {
    const inventories = this.mapInventories();

    return this.players.map((player: Player): PlayerEntity => {
      const playerInventory = inventories.find(inventory => inventory.id === player.inventoryId);
      const playerEquipment = inventories.find(inventory => inventory.id === player.equipmentId);

      const playerInventoryIds = playerInventory?.worldObjectIds ?? [];
      const playerEquipmentIds = playerEquipment?.worldObjectIds ?? [];
      const worldObjects = this.findWorldObjectByIds([...playerInventoryIds, ...playerEquipmentIds]);

      return createPlayerEntity({
        name: player.name,
        inventory: playerInventoryIds.map((id) => worldObjects.find((wo) => wo.id === id)?.name ?? id),
        equipment: playerEquipmentIds.map((id) => worldObjects.find((wo) => wo.id === id)?.name ?? id)
      });
    });
  }

  getTerraformationLevels(): TerraformationLevelEntity[] {
    return this.terraformationLevels.map((level: TerraformationLevel): TerraformationLevelEntity => createTerraformationLevelEntity({
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

  getStatistics(): StatisticsValueObject | undefined {
    return this.statistics.map((stat) => createStatisticsValueObject({
      totalCraftedObjects: stat.craftedObjects
    }))[0];
  }

  getSaveConfiguration(): SaveConfigurationValueObject | undefined {
    return this.saveConfiguration.map((config) => createSaveConfigurationValueObject({
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

  getEnergyLevelsRawData(): EnergyLevelsRawDataValueObject {

    // NOTE: production/consumption are scoped per-planet — each planet has its own independent
    // power grid in-game (see docs/energy-levels.md, section 4). The actual production/
    // consumption/optimizer-boost rules are domain logic — see
    // `domain/rules/computePlanetEnergyLevels.ts`. This method only maps the save format's raw
    // world objects into domain entities and groups them by planet.

    const allWorldObjects = [...this.worldObjectsFactory()];
    const positionedWorldObjects = allWorldObjects.filter(
      (worldObject) => worldObject.pos !== undefined && worldObject.planet !== undefined
    );

    const placedWorldObjectsByPlanet = new Map<number, { raw: WorldObject; entity: PlacedWorldObjectEntity }[]>();
    for (const worldObject of positionedWorldObjects) {
      const entity = this.toPlacedWorldObjectEntity(worldObject);
      const planetId = entity.planetId;
      const worldObjectsOnPlanet = placedWorldObjectsByPlanet.get(planetId) ?? [];
      worldObjectsOnPlanet.push({raw: worldObject, entity});
      placedWorldObjectsByPlanet.set(planetId, worldObjectsOnPlanet);
    }

    // Energy Fuses live inside an Optimizer's inventory and are never themselves positioned, so
    // the fuse lookup needs every world object in the save, not just positioned/placed ones.
    const allWorldObjectEntities: WorldObjectEntity[] = allWorldObjects.map((worldObject) => createWorldObjectEntity({
      id: String(worldObject.id),
      name: worldObject.gId as WorldObjectName
    }));
    const inventories = this.mapInventories();
    const knownPlanetNames = [...new Set(this.terraformationLevels.map((level) => level.planetId))];

    const planets: PlanetWorldObjectsValueObject[] = [...placedWorldObjectsByPlanet.entries()]
      .map(([planetId, placedWorldObjectsOnPlanet]) => {
        const rawWorldObjectsOnPlanet = placedWorldObjectsOnPlanet.map(({raw}) => raw);
        const entitiesOnPlanet = placedWorldObjectsOnPlanet.map(({entity}) => entity);

        return createPlanetWorldObjectsValueObject({
          planetId,
          planetName: resolvePlanetName(
            planetId,
            rawWorldObjectsOnPlanet.map((worldObject) => worldObject.gId),
            knownPlanetNames
          ),
          placedWorldObjects: entitiesOnPlanet
        });
      });

    return createEnergyLevelsRawDataValueObject({allWorldObjects: allWorldObjectEntities, inventories, planets});
  }

  private toPlacedWorldObjectEntity(worldObject: WorldObject): PlacedWorldObjectEntity {
    return createPlacedWorldObjectEntity({
      id: String(worldObject.id),
      name: worldObject.gId as WorldObjectName,
      position: parsePosition(worldObject.pos!),
      planetId: worldObject.planet!,
      inventoryId: worldObject.liId
    });
  }

  private mapInventories(): InventoryEntity[] {
    return this.inventories.map((inventory: Inventory): InventoryEntity => createInventoryEntity({
      id: inventory.id,
      worldObjectIds: inventory.woIds.split(',').filter(Boolean),
      size: inventory.size
    }));
  }

  private findWorldObjectByIds(ids: string[]): WorldObjectEntity[] {
    const result: WorldObjectEntity[] = [];
    for (const worldObject of this.worldObjectsFactory()) {
      if (ids.includes(String(worldObject.id))) {
        result.push(createWorldObjectEntity({id: String(worldObject.id), name: worldObject.gId as WorldObjectName}));
      }
    }
    return result;
  }
}
