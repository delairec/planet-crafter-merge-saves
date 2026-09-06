import {describe, it, expect} from 'bun:test';
import {mergeStoryEvents} from './mergeStoryEvents';

describe('Merge story events', () => {
  const storyEventA = {stringId: 'StoryEvent-FirstMessageClick'};
  const storyEventB = {stringId: 'StoryEvent-Toxicity-InfosGoo'};
  const storyEventShared = {stringId: 'StoryEvent-Shared'};

  describe('When story events are unique', () => {
    it('should concat story events from both saves', () => {
      // Act
      const result = mergeStoryEvents([storyEventA], [storyEventB]);

      // Assert
      expect(result).toEqual([
        {stringId: 'StoryEvent-FirstMessageClick'},
        {stringId: 'StoryEvent-Toxicity-InfosGoo'}
      ]);
    });
  });

  describe('When a story event appears in both saves', () => {
    it('should deduplicate story events', () => {
      // Act
      const result = mergeStoryEvents([storyEventShared], [storyEventShared]);

      // Assert
      expect(result).toEqual([{stringId: 'StoryEvent-Shared'}]);
    });
  });
});
