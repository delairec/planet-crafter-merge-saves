import {describe, it, expect} from 'bun:test';
import {mergeWorldEvents} from './mergeWorldEvents';

describe('Merge world events', () => {
  const worldEventA = {planet: 110910045, seed: 12345, pos: '100,200,300'};
  const worldEventB = {planet: 110910046, seed: 67890, pos: '400,500,600'};
  const worldEventShared = {planet: 110910047, seed: 11111, pos: '700,800,900'};

  describe('When world events are unique', () => {
    it('should concat world events from both saves', () => {
      // Act
      const result = mergeWorldEvents([worldEventA], [worldEventB]);

      // Assert
      expect(result).toEqual([
        {planet: 110910045, seed: 12345, pos: '100,200,300'},
        {planet: 110910046, seed: 67890, pos: '400,500,600'}
      ]);
    });
  });

  describe('When a world event appears in both saves', () => {
    it('should deduplicate world events and take save A', () => {
      // Act
      const result = mergeWorldEvents([worldEventShared], [worldEventShared]);

      // Assert
      expect(result).toEqual([{planet: 110910047, seed: 11111, pos: '700,800,900'}]);
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
      const noWorldEventsFromSaveA: never[] = [];

      // Act
      const result = mergeWorldEvents(noWorldEventsFromSaveA, [wreckEvent]);

      // Assert
      expect(result).toEqual([{
        owner: 0, planet: -1140328421, index: 1, seed: 577338550,
        pos: '1250.623,-51.60085,-215.7026', rot: '-0.001,-0.353,-0.010,-0.935',
        wrecksWOGenerated: true, woIdsGenerated: '201234,205678', woIdsDropped: '201234', version: 13
      }]);
    });
  });
});
