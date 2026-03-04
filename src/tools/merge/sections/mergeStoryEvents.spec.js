import {describe, it, expect} from 'bun:test';
import {merge} from '../merge.js';
import {createFakeSaveString} from '../../../utils/testing/fixtures/createFakeSaveString.js';

describe('Merge saves — #7 Story events', () => {
  const saveDisplayName = 'SAVE_NAME';

  const storyEventA = {stringId: 'StoryEvent-FirstMessageClick'};
  const storyEventB = {stringId: 'StoryEvent-Toxicity-InfosGoo'};
  const storyEventShared = {stringId: 'StoryEvent-Shared'};

  describe('When story events are unique', () => {
    it('should concat story events from both saves', () => {
      // Arrange
      const fakeSaveA = createFakeSaveString({storyEvents: [storyEventA]});
      const fakeSaveB = createFakeSaveString({storyEvents: [storyEventB]});
      const {mergeSaves} = merge(fakeSaveA, fakeSaveB, saveDisplayName);

      // Act
      const result = mergeSaves();

      // Assert
      expect(result).toBe(createFakeSaveString({storyEvents: [storyEventA, storyEventB]}));
    });
  });

  describe('When a story event appears in both saves', () => {
    it('should deduplicate story events', () => {
      // Arrange
      const fakeSaveA = createFakeSaveString({storyEvents: [storyEventShared]});
      const fakeSaveB = createFakeSaveString({storyEvents: [storyEventShared]});
      const {mergeSaves} = merge(fakeSaveA, fakeSaveB, saveDisplayName);

      // Act
      const result = mergeSaves();

      // Assert
      expect(result).toBe(createFakeSaveString({storyEvents: [storyEventShared]}));
    });
  });
});

