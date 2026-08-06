import {describe, it, expect} from 'bun:test';
import {mergeTerrainLayers} from './mergeTerrainLayers.js';

describe('Merge terrain layers', () => {
  const terrainLayerA = {layerId: 'PC-Toxicity-Layer2', planet: 110910045, colorBase: '0.69-0.92-0.79-1'};
  const terrainLayerB = {layerId: 'PC-Prime-Layer1', planet: 110910046, colorBase: '0.5-0.5-0.5-1'};
  const terrainLayerShared = {layerId: 'PC-Shared-Layer', planet: 110910047, colorBase: '1-1-1-1'};

  describe('When terrain layers are unique', () => {
    it('should concat terrain layers from both saves', () => {
      // Arrange
      const terrainLayersFromSaveA = [terrainLayerA];
      const terrainLayersFromSaveB = [terrainLayerB];

      // Act
      const result = mergeTerrainLayers(terrainLayersFromSaveA, terrainLayersFromSaveB);

      // Assert
      expect(result).toBe(`${JSON.stringify(terrainLayerA)}|\n${JSON.stringify(terrainLayerB)}`);
    });
  });

  describe('When a terrain layer appears in both saves with same layerId and planetId', () => {
    it('should deduplicate and take save A', () => {
      // Arrange
      const layerInSaveA = {...terrainLayerShared, colorBase: '0.1-0.2-0.3-1'};
      const layerInSaveB = {...terrainLayerShared, colorBase: '0.9-0.8-0.7-1'};

      // Act
      const result = mergeTerrainLayers([layerInSaveA], [layerInSaveB]);

      // Assert
      expect(result).toBe(JSON.stringify(layerInSaveA));
    });
  });

  describe('When terrain layers share the same layerId but have different planetId', () => {
    it('should keep both terrain layers', () => {
      // Arrange
      const layerInSaveA = {...terrainLayerShared, planet: 111111111};
      const layerInSaveB = {...terrainLayerShared, planet: 222222222};

      // Act
      const result = mergeTerrainLayers([layerInSaveA], [layerInSaveB]);

      // Assert
      expect(result).toBe(`${JSON.stringify(layerInSaveA)}|\n${JSON.stringify(layerInSaveB)}`);
    });
  });
});

