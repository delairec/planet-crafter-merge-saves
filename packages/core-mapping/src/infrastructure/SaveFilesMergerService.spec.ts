import {describe, expect, it} from 'bun:test';
import {SaveFilesMergerService} from './SaveFilesMergerService';
import {createFakeSaveContent} from 'shared-save-processing/testing/createFakeSaveContent.js';
import {createFakeSaveString} from 'shared-save-processing/testing/createFakeSaveString.js';
import {stringifyEntry} from 'shared-save-processing/stringifyEntry.js';
import {parseSaveSections} from 'shared-save-processing/parseSaveSections.js';
import {INVENTORIES_SECTION_INDEX, WORLD_OBJECTS_SECTION_INDEX} from 'shared-save-processing/sectionIndexes.js';
import {createEquipment, createInventory, createPlayer, createWorldObject} from 'shared-save-processing/testing/createSaveRecords.js';
import {UnreadableSaveContentError} from './errors/UnreadableSaveContentError';

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
      const player = createPlayer({id: '1', name: 'PlayerA', inventoryId: 10, equipmentId: 11});
      const contentA = createFakeSaveString({
        players: [player],
        inventories: [createInventory({id: 10, woIds: '', size: 20}), createEquipment({id: 11, woIds: '', size: 10}), createInventory({id: 50, woIds: '100', size: 35})],
        worldObjects: [createWorldObject({id: 100, gId: 'Container2', liId: 50, pos: '1,0,1'})]
      });
      const contentB = createFakeSaveString({
        players: [player],
        inventories: [createInventory({id: 10, woIds: '', size: 20}), createEquipment({id: 11, woIds: '', size: 10}), createInventory({id: 50, woIds: '999', size: 1})],
        worldObjects: [createWorldObject({id: 200, gId: 'VegetubeOutside1', liId: 50, pos: '5,0,5'})]
      });

      // Act
      const result = service.merge('Standard-1.json', contentA, 'Standard-2.json', contentB);

      // Assert
      const {sections} = parseSaveSections(result.content);
      expect([...sections[WORLD_OBJECTS_SECTION_INDEX]()]).toEqual([
        {id: 100, gId: 'Container2', liId: 50, pos: '1,0,1'},
        {id: 200, gId: 'VegetubeOutside1', liId: 201, pos: '5,0,5'}
      ]);
      expect(sections[INVENTORIES_SECTION_INDEX]).toEqual([
        {id: 10, woIds: '', size: 20},
        {id: 11, woIds: '', size: 10},
        {id: 50, woIds: '100', size: 35},
        {id: 201, woIds: '999', size: 1}
      ]);
    });
  });

  describe('When a save reaches the merger with a line that cannot be read', () => {
    it('should stop the merge, naming the file and the line, rather than produce an amputated save', () => {
      // Arrange
      const service = new SaveFilesMergerService();
      const unreadableInventory = createEquipment({id: 45, woIds: '', size: 20});
      const contentA = createFakeSaveContent({inventories: [unreadableInventory]})
        .replace(JSON.stringify(unreadableInventory), '{not valid json');
      const contentB = createFakeSaveContent();

      // Act
      const mergeSaveFiles = () => service.merge('Standard-1.json', contentA, 'Standard-2.json', contentB);

      // Assert
      expect(mergeSaveFiles).toThrow(UnreadableSaveContentError);
      expect(mergeSaveFiles).toThrow('Save file "Standard-1.json" cannot be parsed: Invalid JSON: {not valid json');
    });

    it('should stop the merge when the unreadable line is a world object, only readable while the section is serialized', () => {
      // Arrange
      const service = new SaveFilesMergerService();
      const unreadableWorldObject = createWorldObject({id: 79111656, gId: 'Phytoplankton3'});
      const contentA = createFakeSaveContent();
      const contentB = createFakeSaveContent()
        .replace(stringifyEntry(unreadableWorldObject), '{not valid json');

      // Act
      const mergeSaveFiles = () => service.merge('Standard-1.json', contentA, 'Standard-2.json', contentB);

      // Assert
      expect(mergeSaveFiles).toThrow(UnreadableSaveContentError);
      expect(mergeSaveFiles).toThrow('Save file "Standard-2.json" cannot be parsed: Invalid JSON: {not valid json');
    });
  });
});
