import {describe, expect, it} from 'bun:test';
import {mergeSaveSections} from './mergeSaveSections';
import {FAKE_SAVE_CONFIGURATION} from 'shared-save-processing/testing/createFakeSaveString.js';
import {createFakeParsedSave} from "shared-save-processing/testing/createFakeParsedSave.js";

describe('Merge saves — #determineSaveOrder', () => {
    const saveDisplayName = 'SAVE_NAME';

    const primeConfig = {...FAKE_SAVE_CONFIGURATION, saveDisplayName: 'SavePrime', planetId: 'Prime'};
    const toxicityConfig = {...FAKE_SAVE_CONFIGURATION, saveDisplayName: 'SaveToxicity', planetId: 'Toxicity'};
    const aqualisConfig = {...FAKE_SAVE_CONFIGURATION, saveDisplayName: 'SaveAqualis', planetId: 'Aqualis'};

    describe('When only the second save has Prime as planetId', () => {
        it('should return the Prime save as save A', () => {
            // Arrange
            const saveA = createFakeParsedSave({saveConfigurations: [toxicityConfig]});
            const saveB = createFakeParsedSave({saveConfigurations: [primeConfig]});

            // Act
            const result = mergeSaveSections(saveA.sections, saveB.sections, saveDisplayName);

            // Assert
            expect(result.saveConfiguration).toEqual({...primeConfig, saveDisplayName: 'SAVE_NAME'});
        });
    });

    describe('When only the first save has Prime as planetId', () => {
        it('should keep the Prime save as save A', () => {
            // Arrange
            const saveA = createFakeParsedSave({saveConfigurations: [primeConfig]});
            const saveB = createFakeParsedSave({saveConfigurations: [toxicityConfig]});

            // Act
            const result = mergeSaveSections(saveA.sections, saveB.sections, saveDisplayName);

            // Assert
            expect(result.saveConfiguration).toEqual({...primeConfig, saveDisplayName: 'SAVE_NAME'});
        });
    });

    describe('When neither save has Prime as planetId', () => {
        it('should return saves in the original order', () => {
            // Arrange
            const saveA = createFakeParsedSave({saveConfigurations: [toxicityConfig]});
            const saveB = createFakeParsedSave({saveConfigurations: [aqualisConfig]});

            // Act
            const result = mergeSaveSections(saveA.sections, saveB.sections, saveDisplayName);

            // Assert
            expect(result.saveConfiguration).toEqual({...toxicityConfig, saveDisplayName: 'SAVE_NAME'});
        });
    });

    describe('When both saves have Prime as planetId', () => {
        it('should return saves in the original order', () => {
            // Arrange
            const saveA = createFakeParsedSave({saveConfigurations: [{...primeConfig, worldSeed: 1}]});
            const saveB = createFakeParsedSave({saveConfigurations: [{...primeConfig, worldSeed: 2}]});

            // Act
            const result = mergeSaveSections(saveA.sections, saveB.sections, saveDisplayName);

            // Assert
            expect(result.saveConfiguration).toEqual({...primeConfig, worldSeed: 1, saveDisplayName: 'SAVE_NAME'});
        });
    });

    describe('When a save has no configuration', () => {
        it('should still promote the Prime save to save A', () => {
            // Arrange
            const saveA = createFakeParsedSave();
            const saveB = createFakeParsedSave({saveConfigurations: [primeConfig]});

            // Act
            const result = mergeSaveSections(saveA.sections, saveB.sections, saveDisplayName);

            // Assert
            expect(result.saveConfiguration).toEqual({...primeConfig, saveDisplayName: 'SAVE_NAME'});
        });
    });
});
