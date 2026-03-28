import {beforeEach, describe, expect, it} from 'bun:test';
import {createFakeSaveContent, player} from '../../util-testing/fixtures/createFakeSaveContent';
import {parseSaveSections} from '../../util-parsing/parseSaveSections.js';
import {PlayerEntity} from "../domain/entities/PlayerEntity";
import {SaveParserService} from './SaveParserService';
import {GlobalProgressionValueObject} from "../domain/valueObjects/GlobalProgressionValueObject";
import {TerraformationLevelEntity} from "../domain/entities/TerraformationLevelEntity";
import {InventoryEntity} from "../domain/entities/InventoryEntity";
import {WorldObjectEntity} from "../domain/entities/WorldObjectEntity";
import {StatisticsValueObject} from "../domain/valueObjects/StatisticsValueObject";
import {SaveConfigurationValueObject} from "../domain/valueObjects/SaveConfigurationValueObject";
import {ParsedSections} from "../../util-types/gameDefinitions";

describe('SaveParserService', () => {
  let sections: ParsedSections;

  beforeEach(() => {
    const fakeSaveContent = createFakeSaveContent(
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
    );

    ({sections} = parseSaveSections(fakeSaveContent));
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

  describe('When global metadata are missing', () => {
    it('should use fallback values', () => {
      // Arrange
      const sectionsWithoutGlobalMetadata = [...sections];
      sectionsWithoutGlobalMetadata[0] = [];
      // @ts-ignore invalid section on purpose
      const service = new SaveParserService(sectionsWithoutGlobalMetadata);

      // Act
      const metadata = service.getGlobalMetadata();

      // Assert
      expect(metadata).toEqual<GlobalProgressionValueObject>({
        allTimeTerraTokens: 0
      });
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
      inventory: ['Phytoplankton1', 'PulsarQuartz'],
      equipment: ['Backpack7', 'OxygenTank4']
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
      {id: 46, worldObjectIds: ['15974863', '28491667'], size: 20},
      {id: 47, worldObjectIds: ['39187611', '65514812'], size: 10},
    ]);
  });

  it('should extract world objects', () => {
    // Arrange
    const service = new SaveParserService(sections);

    // Act
    const worldObjects = service.getWorldObjects();

    // Assert
    const worldObjectsGenerator = worldObjects(sections);
    expect(worldObjectsGenerator.next().value).toEqual<WorldObjectEntity>({
      id: '79111656',
      label: 'Phytoplankton3'
    });
    expect(worldObjectsGenerator.next().value).toEqual<WorldObjectEntity>({
      id: '58524136',
      label: 'MagnetarQuartz'
    });
    expect(worldObjectsGenerator.next().value).toEqual<WorldObjectEntity>({
      id: '85274195',
      label: 'Backpack4'
    });
    expect(worldObjectsGenerator.next().value).toEqual<WorldObjectEntity>({
      id: '48456321',
      label: 'OxygenTank5'
    });
  });

  it('should extract statistics', () => {
    // Arrange
    const service = new SaveParserService(sections);

    // Act
    const statistics = service.getStatistics();

    // Assert
    expect(statistics).toEqual<StatisticsValueObject>({
      totalCraftedObjects: 10
    });
  });

  it('should extract save configuration', () => {
    // Arrange
    const service = new SaveParserService(sections);

    // Act
    const saveConfiguration = service.getSaveConfiguration();

    // Assert
    expect(saveConfiguration).toEqual<SaveConfigurationValueObject>({
      title: 'Merged Save',
      mode: 'Standard',
      modifiers: {
        terraformationPace: 0.1,
        powerConsumption: 0.2,
        gaugeDrain: 0.3,
        meteoOccurrence: 0.4,
        multiplayerFactor: 0.5
      }
    });
  });
});



