import {
  GLOBAL_METADATA_SECTION_INDEX,
  INVENTORIES_SECTION_INDEX,
  ParsedSave,
  Player,
  PLAYERS_SECTION_INDEX,
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

export class SaveParserService implements SaveParserPort {
  constructor(private readonly sections: ParsedSave) {
  }

  getGlobalMetadata(): GlobalProgressionValueObject {
    const metadata = this.sections[GLOBAL_METADATA_SECTION_INDEX][0];
    return {
      allTimeTerraTokens: metadata.allTimeTerraTokens
    }
  }

  getPlayers(): PlayerEntity[] {

    const inventories = this.getInventories();

    return this.sections[PLAYERS_SECTION_INDEX].map((player: Player): PlayerEntity => {
      const playerInventory = inventories.find(inventory => inventory.id === player.inventoryId);
      const playerEquipment = inventories.find(inventory => inventory.id === player.equipmentId);

      const playerInventoryIds = playerInventory?.worldObjectIds ?? [];
      const playerEquipmentIds = playerEquipment?.worldObjectIds ?? [];
      const worldObjects = this.findWorldObjectByIds([...playerInventoryIds, ...playerEquipmentIds]);

      return {
        name: player.name,
        inventory: playerInventoryIds.map((id)=>{
          return worldObjects.find((worldObject) => worldObject.id === id)?.label ?? id;
        }),
        equipment: playerEquipmentIds.map((id)=> {
          return worldObjects.find((worldObject) => worldObject.id === id)?.label ?? id;
        })
      };
    });
  }

  getTerraformationLevels(): TerraformationLevelEntity[] {
    return this.sections[TERRAFORMATION_LEVELS_SECTION_INDEX].map((level: TerraformationLevel): TerraformationLevelEntity => ({
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
    return this.sections[INVENTORIES_SECTION_INDEX].map((inventory:Inventory): InventoryEntity => ({
      id:inventory.id,
      worldObjectIds: inventory.woIds.split(',').filter(Boolean),
      size: inventory.size
    }));
  }

  getWorldObjects(): Generator<WorldObjectEntity> {
    return (function* (sections:ParsedSave) {

      for (const worldObject of sections[WORLD_OBJECTS_SECTION_INDEX]) {
        yield {
          id: String(worldObject.id),
          label: worldObject.gId
        };
      }

    })(this.sections);
  }

  private findWorldObjectByIds(ids:string[]): WorldObjectEntity[] {
    let worldObjects: WorldObjectEntity[] = [];
    for (const worldObject of this.getWorldObjects()) {
      console.log('OHE', worldObject.id)
      if (ids.includes(worldObject.id)) {
        worldObjects.push(worldObject);
      }
    }
    return worldObjects;
  }
}
