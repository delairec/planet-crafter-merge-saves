import {describe, it, expect} from 'bun:test';
import {merge} from '../merge.js';
import {createFakeSaveString} from '../../../utils/testing/fixtures/createFakeSaveString.js';

describe('Merge saves — #9 Terrain layers', () => {
  const saveDisplayName = 'SAVE_NAME';

  const terrainLayerA = {layerId: 'PC-Toxicity-Layer2', planet: 110910045, colorBase: '0.69-0.92-0.79-1'};
  const terrainLayerB = {layerId: 'PC-Prime-Layer1', planet: 110910046, colorBase: '0.5-0.5-0.5-1'};
  const terrainLayerShared = {layerId: 'PC-Shared-Layer', planet: 110910047, colorBase: '1-1-1-1'};

  describe('When terrain layers are unique', () => {
    it('should concat terrain layers from both saves', () => {
      // Arrange
      const fakeSaveA = createFakeSaveString({terrainLayers: [terrainLayerA]});
      const fakeSaveB = createFakeSaveString({terrainLayers: [terrainLayerB]});
      const {mergeSaves} = merge(fakeSaveA, fakeSaveB, saveDisplayName);

      // Act
      const result = mergeSaves();

      // Assert
      expect(result).toBe(createFakeSaveString({terrainLayers: [terrainLayerA, terrainLayerB]}));
    });
  });

  describe('When a terrain layer appears in both saves with same layerId and planetId', () => {
    it('should deduplicate and take save A', () => {
      // Arrange
      const layerInSaveA = {...terrainLayerShared, colorBase: '0.1-0.2-0.3-1'};
      const layerInSaveB = {...terrainLayerShared, colorBase: '0.9-0.8-0.7-1'};
      const fakeSaveA = createFakeSaveString({terrainLayers: [layerInSaveA]});
      const fakeSaveB = createFakeSaveString({terrainLayers: [layerInSaveB]});
      const {mergeSaves} = merge(fakeSaveA, fakeSaveB, saveDisplayName);

      // Act
      const result = mergeSaves();

      // Assert
      expect(result).toBe(createFakeSaveString({terrainLayers: [layerInSaveA]}));
    });
  });

  describe('When terrain layers share the same layerId but have different planetId', () => {
    it('should keep both terrain layers', () => {
      // Arrange
      const layerInSaveA = {...terrainLayerShared, planet: 111111111};
      const layerInSaveB = {...terrainLayerShared, planet: 222222222};
      const fakeSaveA = createFakeSaveString({terrainLayers: [layerInSaveA]});
      const fakeSaveB = createFakeSaveString({terrainLayers: [layerInSaveB]});
      const {mergeSaves} = merge(fakeSaveA, fakeSaveB, saveDisplayName);

      // Act
      const result = mergeSaves();

      // Assert
      expect(result).toBe(createFakeSaveString({terrainLayers: [layerInSaveA, layerInSaveB]}));
    });
  });
});

