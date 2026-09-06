import {StoryEvent} from 'shared-save-processing/gameDefinitions';

/**
 * @see GR-STORY-1, GR-STORY-2 in docs/game-rules.md
 */
export function mergeStoryEvents(storyEventsA: StoryEvent[], storyEventsB: StoryEvent[]): StoryEvent[] {
  const storyEventsFromBNotInA = storyEventsB.filter(storyEventB =>
    !storyEventsA.some(storyEventA => storyEventA.stringId === storyEventB.stringId)
  );

  return [...storyEventsA, ...storyEventsFromBNotInA];
}
