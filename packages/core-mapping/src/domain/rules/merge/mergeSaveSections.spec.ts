import {describe, expect, it} from 'bun:test';
import {mergeSaveSections} from './mergeSaveSections';
import {createFakeParsedSave} from 'shared-save-processing/testing/createFakeParsedSave.js';
import {createInventory, createPlayer, createWorldObject} from 'shared-save-processing/testing/createSaveRecords.js';
import {ParsedSections} from 'shared-save-processing/gameDefinitions';

describe('Merge saves', () => {
    const saveDisplayName = 'SAVE_NAME';

    function createSections(options: Parameters<typeof createFakeParsedSave>[0]): ParsedSections {
        return createFakeParsedSave(options).sections;
    }

    describe('When both saves carry entries in the sections holding identifiers', () => {
        it('should keep the origin of players, inventories and world objects', () => {
            // Arrange
            const playerFromSaveA = createPlayer({host: false, id: 1, name: 'PlayerA', inventoryId: 10, equipmentId: 11});
            const playerFromSaveB = createPlayer({host: false, id: 2, name: 'PlayerB', inventoryId: 20, equipmentId: 21});
            const inventoryFromSaveA = createInventory({id: 10, woIds: '', size: 20});
            const inventoryFromSaveB = createInventory({id: 20, woIds: '', size: 20});
            const worldObjectFromSaveA = createWorldObject({id: 100, gId: 'Container2', pos: '1,0,1'});
            const worldObjectFromSaveB = createWorldObject({id: 200, gId: 'VegetubeOutside1', pos: '5,0,5'});

            const sectionsA = createSections({
                players: [playerFromSaveA],
                inventories: [inventoryFromSaveA],
                worldObjects: function* () {
                    yield worldObjectFromSaveA;
                }
            });
            const sectionsB = createSections({
                players: [playerFromSaveB],
                inventories: [inventoryFromSaveB],
                worldObjects: function* () {
                    yield worldObjectFromSaveB;
                }
            });

            // Act
            const result = mergeSaveSections(sectionsA, sectionsB, saveDisplayName);

            // Assert
            expect(result.players).toEqual({fromSaveA: [playerFromSaveA], fromSaveB: [playerFromSaveB]});
            expect(result.inventories).toEqual({fromSaveA: [inventoryFromSaveA], fromSaveB: [inventoryFromSaveB]});
            expect(result.worldObjects).toEqual({fromSaveA: [worldObjectFromSaveA], fromSaveB: [worldObjectFromSaveB]});
        });
    });
});
