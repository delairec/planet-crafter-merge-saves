import {describe, expect, it} from 'bun:test';
import {mergeSaveSections} from './mergeSaveSections';
import {createFakeParsedSave} from 'shared-save-processing/testing/createFakeParsedSave.js';
import {ParsedSections} from 'shared-save-processing/gameDefinitions';

describe('Merge saves', () => {
    const saveDisplayName = 'SAVE_NAME';

    function sectionsOf(options: Parameters<typeof createFakeParsedSave>[0]): ParsedSections {
        return createFakeParsedSave(options).sections;
    }

    describe('When both saves carry entries in the sections holding identifiers', () => {
        it('should keep the origin of players, inventories and world objects', () => {
            // Arrange
            const playerFromSaveA = {id: 1, name: 'PlayerA', inventoryId: 10, equipmentId: 11};
            const playerFromSaveB = {id: 2, name: 'PlayerB', inventoryId: 20, equipmentId: 21};
            const inventoryFromSaveA = {id: 10, woIds: '', size: 20};
            const inventoryFromSaveB = {id: 20, woIds: '', size: 20};
            const worldObjectFromSaveA = {id: 100, gId: 'Container2', pos: '1,0,1'};
            const worldObjectFromSaveB = {id: 200, gId: 'VegetubeOutside1', pos: '5,0,5'};

            const sectionsA = sectionsOf({
                players: [playerFromSaveA as never],
                inventories: [inventoryFromSaveA],
                worldObjects: function* () {
                    yield worldObjectFromSaveA;
                }
            });
            const sectionsB = sectionsOf({
                players: [playerFromSaveB as never],
                inventories: [inventoryFromSaveB],
                worldObjects: function* () {
                    yield worldObjectFromSaveB;
                }
            });

            // Act
            const result = mergeSaveSections(sectionsA, sectionsB, saveDisplayName);

            // Assert
            expect({
                playerIds: {
                    fromSaveA: result.players.fromSaveA.map(player => player.id),
                    fromSaveB: result.players.fromSaveB.map(player => player.id)
                },
                inventoryIds: {
                    fromSaveA: result.inventories.fromSaveA.map(inventory => inventory.id),
                    fromSaveB: result.inventories.fromSaveB.map(inventory => inventory.id)
                },
                worldObjectIds: {
                    fromSaveA: result.worldObjects.fromSaveA.map(worldObject => worldObject.id),
                    fromSaveB: result.worldObjects.fromSaveB.map(worldObject => worldObject.id)
                }
            }).toEqual({
                playerIds: {fromSaveA: [1], fromSaveB: [2]},
                inventoryIds: {fromSaveA: [10], fromSaveB: [20]},
                worldObjectIds: {fromSaveA: [100], fromSaveB: [200]}
            });
        });
    });
});
