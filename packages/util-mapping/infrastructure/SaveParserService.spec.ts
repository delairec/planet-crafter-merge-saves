import {beforeEach, describe, expect, it} from 'bun:test';
import {createFakeSaveContent, player} from '../../util-testing/fixtures/createFakeSaveContent';
import {parseSaveSections} from '../../util-parsing/parseSaveSections.js';
import {ParsedSave} from '../../util-types/gameDefinitions';
import {PlayerEntity} from "../domain/entities/PlayerEntity";
import {SaveParserService} from './SaveParserService';
import {GlobalProgressionValueObject} from "../domain/valueObjects/GlobalProgressionValueObject";
import {TerraformationLevelEntity} from "../domain/entities/TerraformationLevelEntity";
import {InventoryEntity} from "../domain/entities/InventoryEntity";
import {WorldObject} from "../../util-types/gameDefinitions/WorldObject";
import {WorldObjectEntity} from "../domain/entities/WorldObjectEntity";

describe('SaveParserService', () => {
  let sections: ParsedSave;

  beforeEach(() => {
    sections = parseSaveSections(createFakeSaveContent(
      {
        players: [{
          ...player,
          name: 'Nikowa',
        }, {
          ...player,
          name: 'Chileny',
          inventoryId: 46,
          equipmentId: 47
        }],
      }
    ));
  });

  it('should extract global metadata', () => {
    // Arrange
    const service = new SaveParserService(sections);

    // Act
    const metadata = service.getGlobalMetadata();

    // Assert
    expect(metadata).toEqual<GlobalProgressionValueObject>({
      allTimeTerraTokens: 200_345
    });
  });

  it('should extract players section', () => {
    // Arrange
    const service = new SaveParserService(sections);

    // Act
    const players = service.getPlayers();

    // Assert
    expect(players).toEqual<PlayerEntity[]>([{
      name: 'Nikowa',
      inventory: ['Phytoplankton3', 'MagnetarQuartz'],
      equipment: ['Backpack4','OxygenTank5']
    }, {
      name: 'Chileny',
      inventory: [],
      equipment: []
    }]);
  });

  it('should extract terraformation levels', () => {
    // Arrange
    const service = new SaveParserService(sections);

    // Act
    const levels = service.getTerraformationLevels();

    // Assert
    expect(levels).toEqual<TerraformationLevelEntity[]>([{
      planetId: 'Toxicity',
      unitOxygenLevel: 100,
      unitHeatLevel: 200,
      unitPressureLevel: 300,
      unitPlantsLevel: 400,
      unitInsectsLevel: 500,
      unitAnimalsLevel: 600,
      unitPurificationLevel: 700
    }]);
  });

  it('should extract inventories', () => {
    // Arrange
    const service = new SaveParserService(sections);

    // Act
    const inventories = service.getInventories();

    // Assert
    expect(inventories).toEqual<InventoryEntity[]>([
      {id: 44, worldObjectIds: ['79111656', '58524136'], size: 20},
      {id: 45, worldObjectIds: ['85274195', '48456321'], size: 10},
    ]);
  });

  it('should extract world objects', () => {
    // Arrange
    const service = new SaveParserService(sections);

    // Act
    const worldObjects = service.getWorldObjects();

    // Assert
    expect(worldObjects.next().value).toEqual<WorldObjectEntity>({
      id: '79111656',
      label: 'Phytoplankton3'
    });
    expect(worldObjects.next().value).toEqual<WorldObjectEntity>({
      id: '58524136',
      label: 'MagnetarQuartz'
    });
    expect(worldObjects.next().value).toEqual<WorldObjectEntity>({
      id: '85274195',
      label: 'Backpack4'
    });
    expect(worldObjects.next().value).toEqual<WorldObjectEntity>({
      id: '48456321',
      label: 'OxygenTank5'
    });
  });
});



