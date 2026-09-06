import {describe, expect, it} from 'bun:test';
import {SaveFilesMergerService} from './SaveFilesMergerService';
import {createFakeSaveContent} from 'shared-save-processing/testing/createFakeSaveContent.js';
import {createFakeSaveString} from 'shared-save-processing/testing/createFakeSaveString.js';
import {parseSaveSections} from 'shared-save-processing/parseSaveSections.js';

describe('SaveFilesMergerService', () => {

  describe('When merging two valid saves', () => {
    it('should return the merged file name combining both save file names', () => {
      // Arrange
      const service = new SaveFilesMergerService();
      const contentA = createFakeSaveContent();
      const contentB = createFakeSaveContent();

      // Act
      const result = service.merge('Standard-1.json', contentA, 'Standard-2.json', contentB);

      // Assert
      expect(result.fileName).toBe('Standard-1-Standard-2-merged.json');
    });

    it('should return the merged save content with terra tokens summed from both saves', () => {
      // Arrange
      const service = new SaveFilesMergerService();
      const contentA = createFakeSaveContent();
      const contentB = createFakeSaveContent();

      // Act
      const result = service.merge('Standard-1.json', contentA, 'Standard-2.json', contentB);

      // Assert
      const globalMetadataSection = JSON.parse(result.content.split('@')[0].trim());
      expect(globalMetadataSection.allTimeTerraTokens).toBe(400_690);
    });
  });

  describe('When a save-B world object is linked to an inventory whose id is already taken by save A', () => {
    it('should point that world object to the renumbered inventory and leave the save-A one untouched', () => {
      // Arrange
      const service = new SaveFilesMergerService();
      const player = {
        id: 1,
        name: 'PlayerA',
        inventoryId: 10,
        equipmentId: 11,
        playerPosition: '0,0,0',
        playerRotation: '0,0,0,0',
        playerGaugeOxygen: 280.0,
        playerGaugeThirst: 96.0,
        playerGaugeHealth: 72.0,
        playerGaugeToxic: 0.0,
        host: true,
        planetId: 'Toxicity',
        cameraView: 0,
        totalCraftedObjects: 0,
        totalTerraTokenEarned: 0
      };
      const contentA = createFakeSaveString({
        players: [player],
        inventories: [{id: 10, woIds: '', size: 20}, {id: 11, woIds: '', size: 10}, {id: 50, woIds: '100', size: 35}],
        worldObjects: [{id: 100, gId: 'Container2', liId: 50, pos: '1,0,1'}]
      });
      const contentB = createFakeSaveString({
        players: [player],
        inventories: [{id: 10, woIds: '', size: 20}, {id: 11, woIds: '', size: 10}, {id: 50, woIds: '999', size: 1}],
        worldObjects: [{id: 200, gId: 'VegetubeOutside1', liId: 50, pos: '5,0,5'}]
      });

      // Act
      const result = service.merge('Standard-1.json', contentA, 'Standard-2.json', contentB);

      // Assert
      const {sections} = parseSaveSections(result.content);
      expect([...sections[3]()]).toEqual([
        {id: 100, gId: 'Container2', liId: 50, pos: '1,0,1'},
        {id: 200, gId: 'VegetubeOutside1', liId: 51, pos: '5,0,5'}
      ]);
      expect(sections[4]).toEqual([
        {id: 10, woIds: '', size: 20},
        {id: 11, woIds: '', size: 10},
        {id: 50, woIds: '100', size: 35},
        {id: 51, woIds: '999', size: 1}
      ]);
    });
  });
});
