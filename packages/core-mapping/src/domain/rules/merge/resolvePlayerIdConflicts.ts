import {Player} from 'shared-save-processing/gameDefinitions';
import {EntriesByOrigin} from './EntriesByOrigin';
import {IdSequence} from './createIdSequence';
import {ResolvedEntries} from './ResolvedEntries';

/**
 * Gives a new identifier to every save B player whose identifier is already used in save A.
 * @see GR-ID-1, GR-ID-2 in docs/game-rules.md
 */
export function resolvePlayerIdConflicts(players: EntriesByOrigin<Player>, idSequence: IdSequence): ResolvedEntries<Player> {
  const usedIds = new Set(players.fromSaveA.map(player => player.id));
  const saveBIdRemapping = new Map<number, number>();

  const fromSaveB = players.fromSaveB.map(player => {
    if (!usedIds.has(player.id)) {
      usedIds.add(player.id);
      return player;
    }

    const newId = idSequence.next();
    saveBIdRemapping.set(player.id, newId);
    return {...player, id: newId};
  });

  return {entries: {fromSaveA: players.fromSaveA, fromSaveB}, saveBIdRemapping};
}
