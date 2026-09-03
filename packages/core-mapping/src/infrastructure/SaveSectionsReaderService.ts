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
import {GlobalProgressionValueObject} from "../domain/valueObjects/GlobalProgressionValueObject";
import {PlayerEntity} from "../domain/entities/PlayerEntity";
import {TerraformationLevelEntity} from '../domain/entities/TerraformationLevelEntity';
import {InventoryEntity} from "../domain/entities/InventoryEntity";
import {WorldObjectEntity} from "../domain/entities/WorldObjectEntity";
import {PlacedWorldObjectEntity} from "../domain/entities/PlacedWorldObjectEntity";
import {StatisticsValueObject} from "../domain/valueObjects/StatisticsValueObject";
import {SaveConfigurationValueObject} from "../domain/valueObjects/SaveConfigurationValueObject";
import {EnergyLevelsValueObject} from "../domain/valueObjects/EnergyLevelsValueObject";
import {PlanetEnergyLevelsValueObject} from "../domain/valueObjects/PlanetEnergyLevelsValueObject";
import {WorldObjectName} from "../domain/worldObjectNames";
import {resolvePlanetName} from "../domain/rules/resolvePlanetName";
import {computePlanetEnergyLevels} from "../domain/rules/computePlanetEnergyLevels";

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
    const allWorldObjectEntities: WorldObjectEntity[] = allWorldObjects.map((worldObject) => ({
      id: String(worldObject.id),
      name: worldObject.gId as WorldObjectName
    }));
    const inventories = this.getInventories();

    const planets: PlanetEnergyLevelsValueObject[] = [...placedWorldObjectsByPlanet.entries()]
      .map(([planetId, placedWorldObjectsOnPlanet]) => {
        const rawWorldObjectsOnPlanet = placedWorldObjectsOnPlanet.map(({raw}) => raw);
        const entitiesOnPlanet = placedWorldObjectsOnPlanet.map(({entity}) => entity);

        const knownPlanetNames = [...new Set(this.terraformationLevels.map((level) => level.planetId))];

        return {
          planetId,
          planetName: resolvePlanetName(
            planetId,
            rawWorldObjectsOnPlanet.map((worldObject) => worldObject.gId),
            knownPlanetNames
          ),
          ...computePlanetEnergyLevels(allWorldObjectEntities, entitiesOnPlanet, inventories)
        };
      });

    return {planets};
  }

  private toPlacedWorldObjectEntity(worldObject: WorldObject): PlacedWorldObjectEntity {
    return {
      id: String(worldObject.id),
      name: worldObject.gId as WorldObjectName,
      position: parsePosition(worldObject.pos!),
      planetId: worldObject.planet!,
      inventoryId: worldObject.liId
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
}
