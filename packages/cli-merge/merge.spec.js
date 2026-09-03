import {describe, expect, it} from 'bun:test';
import {merge} from './merge.js';
import {resolveIdConflicts} from './resolveIdConflicts.js';
import {
    metadata,
    saveConfiguration,
    statistics,
    terraformationLevel
} from "shared-save-processing/testing/createFakeSaveContent.js";
import {createFakeParsedSave} from "shared-save-processing/testing/createFakeParsedSave.js";

describe('Merge saves', () => {
    const saveDisplayName = 'SAVE_NAME';

    it('should handle error in case of wrong save format', () => {
        // Act
        const result = () => merge('invalidSaveFormatA', 'invalidSaveFormatB', saveDisplayName);

        // Assert
        expect(result).toThrow(`ERROR_INVALID_INPUT_FORMAT`);
    });

    describe('Id conflict resolution — save-B world object linked inventory', () => {
        it('should point a save-B world object to its own inventory after merge and id conflict resolution', () => {
            // Arrange
            const playerA = {
                id: 1,
                name: 'PlayerA',
                inventoryId: 10,
                equipmentId: 11,
                host: true,
                playerPosition: '0,0,0',
                playerRotation: '0,0,0,0',
                playerGaugeOxygen: 280.0,
                playerGaugeThirst: 96.0,
                playerGaugeHealth: 72.0,
                playerGaugeToxic: 0.0,
                planetId: 'Toxicity',
                cameraView: 0,
                totalCraftedObjects: 0,
                totalTerraTokenEarned: 0
            };
            const inventoryA = {id: 10, woIds: '', size: 20};
            const equipmentA = {id: 11, woIds: '', size: 10};
            const saveAContainerInventory = {id: 50, woIds: '100', size: 35};
            const saveAContainer = {
                id: 100,
                gId: 'Container2',
                liId: 50,
                pos: '1,0,1',
                rot: '0,0,0,1',
                planet: 110910047
            };

            const saveBVegetubeInventory = {id: 50, woIds: '999', size: 1};
            const saveBVegetube = {
                id: 200,
                gId: 'VegetubeOutside1',
                liId: 50,
                pos: '5,0,5',
                rot: '0,0,0,1',
                planet: 110910047
            };

            const parsedSaveA = createFakeParsedSave({
                sections: [
                    [metadata],
                    [terraformationLevel],
                    [playerA],
                    function* worldObjectsGenerator() {
                        yield saveAContainer;
                    },
                    [inventoryA, equipmentA, saveAContainerInventory],
                    [statistics],
                    [],
                    [],
                    [saveConfiguration],
                    [],
                    []
                ]
            });

            const parsedSaveB = createFakeParsedSave({
                sections: [
                    [metadata],
                    [terraformationLevel],
                    [playerA],
                    function* worldObjectsGenerator() {
                        yield saveBVegetube;
                    },
                    [inventoryA, equipmentA, saveBVegetubeInventory],
                    [statistics],
                    [],
                    [],
                    [saveConfiguration],
                    [],
                    []
                ]
            });

            const {mergeSaves, saveAWorldObjectIds} = merge(parsedSaveA, parsedSaveB, saveDisplayName);

            // Act
            const merged = mergeSaves();
            const result = resolveIdConflicts(merged, saveAWorldObjectIds);

            // Assert
            const sep = /\|\r?\n/;
            const sections = result.split('@');
            const inventories = sections[4].trim().split(sep).filter(Boolean).map(s => JSON.parse(s.trim()));
            const worldObjects = sections[3].trim().split(sep).filter(Boolean).map(s => JSON.parse(s.trim()));
            const saveAContainerResult = worldObjects.find(wo => wo.id === 100);
            const vegetubeInventory = inventories.find(inv => inv.woIds === '999');
            const vegetube = worldObjects.find(wo => wo.gId === 'VegetubeOutside1');

            expect(saveAContainerResult.liId).toBe(50);
            expect(vegetubeInventory).toBeDefined();
            expect(vegetube.liId).toBe(vegetubeInventory.id);
            expect(vegetube.liId).not.toBe(50);
        });
    });
});

