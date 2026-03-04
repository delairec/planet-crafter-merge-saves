/** @import { Player } from '../../../types/js/types.js' */

import {stringifyEntry} from '../../../utils/parsing/stringifyEntry.js';

/**
 * @param {Player[]} playersA
 * @param {Player[]} playersB
 * @returns {string}
 * @see GR-PLAYER-1, GR-PLAYER-2, GR-PLAYER-3 in docs/business-rules.md
 */
export function mergePlayers(playersA, playersB) {
  const validatedPlayersA = playersA ?? [];
  const validatedPlayersB = playersB ?? [];

  const hostFromSaveA = validatedPlayersA.find(player => player.host);

  const playersFromBNotInA = validatedPlayersB.filter(playerB =>
    !validatedPlayersA.some(playerA => playerA.name === playerB.name)
  );

  const mergedPlayers = [...validatedPlayersA, ...playersFromBNotInA];

  return mergedPlayers.map(player =>
    stringifyEntry({...player, host: player.id === hostFromSaveA?.id})
  ).join('|\n');
}

