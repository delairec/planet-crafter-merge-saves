import {describe, it, expect} from 'bun:test';
import {createFakeSaveString, createLegacyFakeSaveString, DEFAULT_GLOBAL_METADATA} from './createFakeSaveString.js';

describe('createFakeSaveString', () => {

  it('should split into 11 `@`-separated parts (10 sections + trailing reserved part)', () => {
    // Act
    const save = createFakeSaveString({});

    // Assert
    expect(save.split('@').length).toBe(11);
  });

  it('should serialize the default global metadata when none is provided', () => {
    // Act
    const save = createFakeSaveString({});

    // Assert
    const [globalMetadataSection] = save.split('\n@\n');
    expect(globalMetadataSection).toBe(JSON.stringify(DEFAULT_GLOBAL_METADATA));
  });

  it('should serialize the provided entries for a given section', () => {
    // Arrange
    const player = /** @type {any} */ ({id: 1, name: 'Nikowa'});

    // Act
    const save = createFakeSaveString({players: [player]});

    // Assert
    const sections = save.split('\n@\n');
    expect(sections[2]).toBe(JSON.stringify(player));
  });

  it('should preserve decimal notation for known float fields', () => {
    // Act
    const save = createFakeSaveString({terraformationLevels: [/** @type {any} */ ({unitOxygenLevel: 100})]});

    // Assert
    const sections = save.split('\n@\n');
    expect(sections[1]).toBe('{"unitOxygenLevel":100.0}');
  });

  describe('When statistics and saveConfiguration are not provided', () => {
    it('should serialize their sections as empty strings', () => {
      // Act
      const save = createFakeSaveString({});

      // Assert
      const sections = save.split('\n@\n');
      expect(sections[5]).toBe('');
      expect(sections[8]).toBe('');
    });
  });
});

describe('createLegacyFakeSaveString', () => {

  it('should split into 12 `@`-separated parts (11 sections + trailing reserved part)', () => {
    // Act
    const save = createLegacyFakeSaveString({});

    // Assert
    expect(save.split('@').length).toBe(12);
  });

  it('should insert the Terrain Layers section right before World Events', () => {
    // Arrange
    const terrainLayer = {layerId: 'PC-Toxicity-Layer1', planet: 110910047, colorBase: '1-1-1-1'};

    // Act
    const save = createLegacyFakeSaveString({terrainLayers: [terrainLayer]});

    // Assert
    const sections = save.split('\n@\n');
    expect(sections[9]).toBe(JSON.stringify(terrainLayer));
  });

  it('should keep World Events after the inserted Terrain Layers section', () => {
    // Arrange
    const worldEvent = {planet: 110910045, seed: 1, pos: '0,0,0', owner: 0, index: 0};

    // Act
    const save = createLegacyFakeSaveString({worldEvents: [worldEvent]});

    // Assert
    const sections = save.replace(/\n@$/, '').split('\n@\n');
    expect(sections[10]).toBe(JSON.stringify(worldEvent));
  });
});
