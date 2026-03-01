import {describe, it, expect} from 'bun:test';
import {merge} from './merge.js';
import {createFakeSaveString} from '../utils/testing/fixtures/createFakeSaveString.js';

describe('Merge saves — #3 World objects', () => {
  const saveDisplayName = 'SAVE_NAME';

  const worldObjectA = {id: 101, gId: 'SomeObject', pos: '100,200,300', rot: '0,0,0,1', planet: 110910047};
  const worldObjectB = {id: 201, gId: 'OtherObject', pos: '400,500,600', rot: '0,0,0,1', planet: 110910047};
  const worldObjectShared = {id: 301, gId: 'SharedObject', pos: '700,800,900', rot: '0,0,0,1', planet: 110910047};

  describe('When world objects are unique', () => {
    it('should concat world objects from both saves', () => {
      // Arrange
      const fakeSaveA = createFakeSaveString({worldObjects: [worldObjectA]});
      const fakeSaveB = createFakeSaveString({worldObjects: [worldObjectB]});
      const {mergeSaves} = merge(fakeSaveA, fakeSaveB, saveDisplayName);

      // Act
      const result = mergeSaves();

      // Assert
      expect(result).toBe(createFakeSaveString({worldObjects: [worldObjectA, worldObjectB]}));
    });
  });

  describe('When a world object appears in both saves with the same pos', () => {
    it('should deduplicate by pos and keep only the one from save A', () => {
      // Arrange
      const worldObjectInSaveA = {...worldObjectShared, id: 301};
      const worldObjectInSaveB = {...worldObjectShared, id: 999};
      const fakeSaveA = createFakeSaveString({worldObjects: [worldObjectInSaveA]});
      const fakeSaveB = createFakeSaveString({worldObjects: [worldObjectInSaveB]});
      const {mergeSaves} = merge(fakeSaveA, fakeSaveB, saveDisplayName);

      // Act
      const result = mergeSaves();

      // Assert
      expect(result).toBe(createFakeSaveString({worldObjects: [worldObjectInSaveA]}));
    });
  });

  describe('When two world objects share the same pos but are on different planets', () => {
    it('should keep both world objects as they are distinct objects', () => {
      // Arrange
      const worldObjectOnPlanetA = {id: 101, gId: 'SomeObject', pos: '100,200,300', rot: '0,0,0,1', planet: 111111111};
      const worldObjectOnPlanetB = {id: 201, gId: 'SomeObject', pos: '100,200,300', rot: '0,0,0,1', planet: 222222222};
      const fakeSaveA = createFakeSaveString({worldObjects: [worldObjectOnPlanetA]});
      const fakeSaveB = createFakeSaveString({worldObjects: [worldObjectOnPlanetB]});
      const {mergeSaves} = merge(fakeSaveA, fakeSaveB, saveDisplayName);

      // Act
      const result = mergeSaves();

      // Assert
      expect(result).toBe(createFakeSaveString({worldObjects: [worldObjectOnPlanetA, worldObjectOnPlanetB]}));
    });
  });

  describe('When a world object has an integer hunger value', () => {
    it('should preserve decimal notation for whole number hunger values', () => {
      // Arrange
      const dnaSequence = {id: 101, gId: 'DNASequence', liId: 1196, grwth: 100, hunger: 100};
      const fakeSaveA = createFakeSaveString({worldObjects: [dnaSequence]});
      const fakeSaveB = createFakeSaveString({});
      const {mergeSaves} = merge(fakeSaveA, fakeSaveB, saveDisplayName);

      // Act
      const result = mergeSaves();

      // Assert
      expect(result).toBe(createFakeSaveString({worldObjects: [{id:101, gId:"DNASequence", liId:1196, grwth:100, hunger:100.0}]}));
    });
  });
});

