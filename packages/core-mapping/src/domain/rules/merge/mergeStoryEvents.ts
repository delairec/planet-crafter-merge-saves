import {StoryEvent} from 'shared-save-processing/gameDefinitions';

/**
 * @see GR-STORY-1, GR-STORY-2 in docs/game-rules.md
 */
export function mergeStoryEvents(storyEventsA: StoryEvent[], storyEventsB: StoryEvent[]): string {
  const validatedStoryEventsA = storyEventsA ?? [];
  const validatedStoryEventsB = storyEventsB ?? [];

  const storyEventsFromBNotInA = validatedStoryEventsB.filter(storyEventB =>
    !validatedStoryEventsA.some(storyEventA => storyEventA.stringId === storyEventB.stringId)
  );

  return [...validatedStoryEventsA, ...storyEventsFromBNotInA]
    .map(storyEvent => JSON.stringify(storyEvent))
    .join('|\n');
}
