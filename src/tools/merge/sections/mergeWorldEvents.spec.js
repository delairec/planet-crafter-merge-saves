import {describe, it, expect} from 'bun:test';
import {merge} from '../merge.js';
import {createFakeSaveString} from '../../../utils/testing/fixtures/createFakeSaveString.js';

describe('Merge saves — #10 World events', () => {
  const saveDisplayName = 'SAVE_NAME';

  const worldEventA = {planet: 110910045, seed: 12345, pos: '100,200,300'};
  const worldEventB = {planet: 110910046, seed: 67890, pos: '400,500,600'};
  const worldEventShared = {planet: 110910047, seed: 11111, pos: '700,800,900'};

  describe('When world events are unique', () => {
    it('should concat world events from both saves', () => {
      // Arrange
      const fakeSaveA = createFakeSaveString({worldEvents: [worldEventA]});
      const fakeSaveB = createFakeSaveString({worldEvents: [worldEventB]});
      const {mergeSaves} = merge(fakeSaveA, fakeSaveB, saveDisplayName);

      // Act
      const result = mergeSaves();

      // Assert
      expect(result).toBe(createFakeSaveString({worldEvents: [worldEventA, worldEventB]}));
    });
  });

  describe('When a world event appears in both saves', () => {
    it('should deduplicate world events and take save A', () => {
      // Arrange
      const fakeSaveA = createFakeSaveString({worldEvents: [worldEventShared]});
      const fakeSaveB = createFakeSaveString({worldEvents: [worldEventShared]});
      const {mergeSaves} = merge(fakeSaveA, fakeSaveB, saveDisplayName);

      // Act
      const result = mergeSaves();

      // Assert
      expect(result).toBe(createFakeSaveString({worldEvents: [worldEventShared]}));
    });
  });

  describe('When world events have additional properties (wrecks)', () => {
    it('should preserve all properties of wreck world events', () => {
      // Arrange
      const wreckEvent = {
        owner: 0, planet: -1140328421, index: 1, seed: 577338550,
        pos: '1250.623,-51.60085,-215.7026', rot: '-0.001,-0.353,-0.010,-0.935',
        wrecksWOGenerated: true, woIdsGenerated: '201234,205678', woIdsDropped: '201234', version: 13
      };
      const fakeSaveA = createFakeSaveString({worldEvents: []});
      const fakeSaveB = createFakeSaveString({worldEvents: [wreckEvent]});
      const {mergeSaves} = merge(fakeSaveA, fakeSaveB, saveDisplayName);

      // Act
      const result = mergeSaves();

      // Assert
      expect(result).toBe(createFakeSaveString({worldEvents: [wreckEvent]}));
    });
  });
});

