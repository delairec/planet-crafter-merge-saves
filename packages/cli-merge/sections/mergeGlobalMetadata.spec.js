import {describe, expect, it} from 'bun:test';
import {mergeGlobalMetadata} from './mergeGlobalMetadata.js';

describe('Merge global metadata', () => {
    const metadataFromSaveA = {
        terraTokens: 122279,
        allTimeTerraTokens: 222154,
        unlockedGroups: 'MultiToolMineSpeed1,BootsSpeed1,BootsSpeed2,SofaColored',
        openedInstanceSeed: 0,
        openedInstanceTimeLeft: 2
    };

    const metadataFromSaveB = {
        terraTokens: 10928,
        allTimeTerraTokens: 11456,
        unlockedGroups: 'MultiToolMineSpeed1,BootsSpeed1,BedDoubleColored',
        openedInstanceSeed: 1,
        openedInstanceTimeLeft: 5
    };

    describe('When both saves contain full global metadata', () => {
        it('should sum terra tokens', () => {
            // Act
            const mergeResult = mergeGlobalMetadata([metadataFromSaveA], [metadataFromSaveB]);

            // Assert
            expect(JSON.parse(mergeResult).terraTokens).toBe(133207);
        });

        it('should sum all-time terra tokens', () => {
            // Act
            const mergeResult = mergeGlobalMetadata([metadataFromSaveA], [metadataFromSaveB]);

            // Assert
            expect(JSON.parse(mergeResult).allTimeTerraTokens).toBe(233610);
        });

        it('should merge unlocked groups without duplicates', () => {
            // Act
            const mergeResult = mergeGlobalMetadata([metadataFromSaveA], [metadataFromSaveB]);

            // Assert
            expect(JSON.parse(mergeResult).unlockedGroups.split(',').sort()).toEqual([
                'BedDoubleColored',
                'BootsSpeed1',
                'BootsSpeed2',
                'MultiToolMineSpeed1',
                'SofaColored'
            ].sort());
        });

        it('should keep the instance seed from save A', () => {
            // Act
            const mergeResult = mergeGlobalMetadata([metadataFromSaveA], [metadataFromSaveB]);

            // Assert
            expect(JSON.parse(mergeResult).openedInstanceSeed).toBe(0);
        });

        it('should keep the remaining instance time from save A', () => {
            // Act
            const mergeResult = mergeGlobalMetadata([metadataFromSaveA], [metadataFromSaveB]);

            // Assert
            expect(JSON.parse(mergeResult).openedInstanceTimeLeft).toBe(2);
        });
    });

    describe('When save A has no global metadata', () => {
        it('should fall back to save B global metadata', () => {
            // Arrange
            const noMetadataFromSaveA = [];

            // Act
            const mergeResult = mergeGlobalMetadata(noMetadataFromSaveA, [metadataFromSaveB]);

            // Assert
            expect(JSON.parse(mergeResult)).toEqual(metadataFromSaveB);
        });
    });

    describe('When save B has no global metadata', () => {
        it('should fall back to save A global metadata', () => {
            // Arrange
            const noMetadataFromSaveB = [];

            // Act
            const mergeResult = mergeGlobalMetadata([metadataFromSaveA], noMetadataFromSaveB);

            // Assert
            expect(JSON.parse(mergeResult)).toEqual(metadataFromSaveA);
        });
    });

    describe('When unlocked groups contain JSON special characters', () => {
        it('should produce parseable JSON', () => {
            // Arrange
            const escapedGroup = 'Group"With\\Slash';
            const metadataWithEscapedGroup = {...metadataFromSaveA, unlockedGroups: escapedGroup};

            // Act
            const mergeResult = mergeGlobalMetadata([metadataWithEscapedGroup], []);

            // Assert
            expect(JSON.parse(mergeResult).unlockedGroups).toBe(escapedGroup);
        });
    });

    describe('When unlocked groups lists are empty', () => {
        it('should return an empty list', () => {
            // Arrange
            const metadataFromSaveAWithoutGroups = {...metadataFromSaveA, unlockedGroups: ''};
            const metadataFromSaveBWithoutGroups = {...metadataFromSaveB, unlockedGroups: ''};

            // Act
            const mergeResult = mergeGlobalMetadata([metadataFromSaveAWithoutGroups], [metadataFromSaveBWithoutGroups]);

            // Assert
            expect(JSON.parse(mergeResult).unlockedGroups).toBe('');
        });

        it('should ignore an empty unlocked groups list from save A', () => {
            // Arrange
            const metadataFromSaveAWithoutGroups = {...metadataFromSaveA, unlockedGroups: ''};
            const metadataFromSaveBWithGroups = {...metadataFromSaveB, unlockedGroups: 'GroupB'};

            // Act
            const mergeResult = mergeGlobalMetadata([metadataFromSaveAWithoutGroups], [metadataFromSaveBWithGroups]);

            // Assert
            expect(JSON.parse(mergeResult).unlockedGroups).toBe('GroupB');
        });

        it('should ignore an empty unlocked groups list from save B', () => {
            // Arrange
            const metadataFromSaveAWithGroups = {...metadataFromSaveA, unlockedGroups: 'GroupA'};
            const metadataFromSaveBWithoutGroups = {...metadataFromSaveB, unlockedGroups: ''};

            // Act
            const mergeResult = mergeGlobalMetadata([metadataFromSaveAWithGroups], [metadataFromSaveBWithoutGroups]);

            // Assert
            expect(JSON.parse(mergeResult).unlockedGroups).toBe('GroupA');
        });
    });
});

