import {describe, expect, it} from 'bun:test';
import {mergeSaveSections} from './mergeSaveSections';
import {createFakeParsedSave} from 'shared-save-processing/testing/createFakeParsedSave.js';
import {ParsedSections} from 'shared-save-processing/gameDefinitions';

describe('Merge saves', () => {
    const saveDisplayName = 'SAVE_NAME';

    const basePlayer = {
        playerPosition: '0,0,0',
        playerRotation: '0,0,0,0',
        playerGaugeOxygen: 280.0,
        playerGaugeThirst: 96.0,
        playerGaugeHealth: 72.0,
        playerGaugeToxic: 0.0,
        host: false,
        planetId: 'Toxicity',
        cameraView: 0,
        totalCraftedObjects: 0,
        totalTerraTokenEarned: 0
    };

    function createSections(options: Parameters<typeof createFakeParsedSave>[0]): ParsedSections {
        return createFakeParsedSave(options).sections;
    }

    describe('When both saves carry entries in the sections holding identifiers', () => {
        it('should keep the origin of players, inventories and world objects', () => {
            // Arrange
            const playerFromSaveA = {...basePlayer, id: 1, name: 'PlayerA', inventoryId: 10, equipmentId: 11};
            const playerFromSaveB = {...basePlayer, id: 2, name: 'PlayerB', inventoryId: 20, equipmentId: 21};
            const inventoryFromSaveA = {id: 10, woIds: '', size: 20};
            const inventoryFromSaveB = {id: 20, woIds: '', size: 20};
            const worldObjectFromSaveA = {id: 100, gId: 'Container2', pos: '1,0,1'};
            const worldObjectFromSaveB = {id: 200, gId: 'VegetubeOutside1', pos: '5,0,5'};

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
