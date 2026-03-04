/** @import { StoryEvent } from '../../../types/js/types.js' */

/**
 * @param {StoryEvent[]} storyEventsA
 * @param {StoryEvent[]} storyEventsB
 * @returns {string}
 * @see GR-STORY-1, GR-STORY-2 in docs/business-rules.md
 */
export function mergeStoryEvents(storyEventsA, storyEventsB) {
  const validatedStoryEventsA = storyEventsA ?? [];
  const validatedStoryEventsB = storyEventsB ?? [];

  const storyEventsFromBNotInA = validatedStoryEventsB.filter(storyEventB =>
    !validatedStoryEventsA.some(storyEventA => storyEventA.stringId === storyEventB.stringId)
  );

  return [...validatedStoryEventsA, ...storyEventsFromBNotInA]
    .map(storyEvent => JSON.stringify(storyEvent))
    .join('|\n');
}

