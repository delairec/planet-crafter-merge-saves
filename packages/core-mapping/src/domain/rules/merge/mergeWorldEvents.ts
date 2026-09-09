import {WorldEvent} from 'shared-save-processing/gameDefinitions';

/**
 * @see GR-EVT-1, GR-EVT-2 in docs/game-rules.md
 */
export function mergeWorldEvents(worldEventsA: WorldEvent[], worldEventsB: WorldEvent[]): WorldEvent[] {
  const worldEventsFromBNotInA = worldEventsB.filter(eventB =>
    !worldEventsA.some(eventA =>
      eventA.planet === eventB.planet &&
      eventA.seed === eventB.seed &&
      eventA.pos === eventB.pos
    )
  );

  return [...worldEventsA, ...worldEventsFromBNotInA];
}
