import {describe, it, expect} from 'bun:test';
import {serializeSave} from './serializeSave.js';

describe('serializeSave', () => {
  const emptyParams = {
    metadata: [],
    terraformationLevels: [],
    players: [],
    serializedWorldObjects: '',
    inventories: [],
    statistics: [],
    mailboxes: [],
    storyEvents: [],
    saveConfigurations: [],
    worldEvents: [],
  };

  it('should join all sections with the section separator and terminate the save', () => {
    // Act
    const result = serializeSave(emptyParams);

    // Assert
    expect(result).toBe('\n@\n'.repeat(9) + '\n@');
  });

  it('should pass serializedWorldObjects through unchanged', () => {
    // Arrange
    const params = {...emptyParams, serializedWorldObjects: 'raw-world-objects'};

    // Act
    const sections = serializeSave(params).split('\n@\n');

    // Assert
    expect(sections[3]).toBe('raw-world-objects');
  });

  describe('When statistics is empty', () => {
    it('should serialize the statistics section as an empty string', () => {
      // Act
      const sections = serializeSave(emptyParams).split('\n@\n');

      // Assert
      expect(sections[5]).toBe('');
    });
  });

  describe('When statistics has an entry', () => {
    it('should serialize that single entry', () => {
      // Arrange
      const params = /** @type {any} */ ({...emptyParams, statistics: [{craftedObjects: 10}]});

      // Act
      const sections = serializeSave(params).split('\n@\n');

      // Assert
      expect(sections[5]).toBe('{"craftedObjects":10}');
    });
  });

  describe('When saveConfigurations is empty', () => {
    it('should serialize the save configuration section as an empty string', () => {
      // Act
      const sections = serializeSave(emptyParams).split('\n@\n');

      // Assert
      expect(sections[8]).toBe('');
    });
  });

  describe('When saveConfigurations has an entry', () => {
    it('should serialize that single entry', () => {
      // Arrange
      const params = /** @type {any} */ ({...emptyParams, saveConfigurations: [{saveDisplayName: 'Fake Save'}]});

      // Act
      const sections = serializeSave(params).split('\n@\n');

      // Assert
      expect(sections[8]).toBe('{"saveDisplayName":"Fake Save"}');
    });
  });

  it('should preserve decimal notation for known float fields in terraformation levels and players', () => {
    // Arrange
    const params = /** @type {any} */ ({
      ...emptyParams,
      terraformationLevels: [{unitOxygenLevel: 100}],
      players: [{playerGaugeOxygen: 280}],
    });

    // Act
    const sections = serializeSave(params).split('\n@\n');

    // Assert
    expect(sections[1]).toBe('{"unitOxygenLevel":100.0}');
    expect(sections[2]).toBe('{"playerGaugeOxygen":280.0}');
  });
});
