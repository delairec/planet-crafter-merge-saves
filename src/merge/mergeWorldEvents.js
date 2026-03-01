/** @import { WorldEvent } from '../types.js' */

/**
 * @param {WorldEvent[]} worldEventsA
 * @param {WorldEvent[]} worldEventsB
 * @returns {string}
 * @see GR-EVT-1, GR-EVT-2 in docs/game-rules.md
 */
export function mergeWorldEvents(worldEventsA, worldEventsB) {
  const validatedWorldEventsA = worldEventsA ?? [];
  const validatedWorldEventsB = worldEventsB ?? [];

  const worldEventsFromBNotInA = validatedWorldEventsB.filter(eventB =>
    !validatedWorldEventsA.some(eventA =>
      eventA.planet === eventB.planet &&
      eventA.seed === eventB.seed &&
      eventA.pos === eventB.pos
    )
  );

  return [...validatedWorldEventsA, ...worldEventsFromBNotInA]
    .map(worldEvent => JSON.stringify(worldEvent))
    .join('|\n');
}

