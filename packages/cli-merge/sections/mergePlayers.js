/** @import { Player } from '../../util-types/js/types.js' */
/** @typedef {Omit<Player, 'cameraView'|'totalCraftedObjects'|'totalTerraTokenEarned'> & Partial<Pick<Player, 'cameraView'|'totalCraftedObjects'|'totalTerraTokenEarned'>>} LegacyCompatiblePlayer */

import {stringifyEntry} from '../../util-parsing/stringifyEntry.js';

const NUMBER_FIELD_FALLBACKS = {
  cameraView: 0,
  totalCraftedObjects: 0,
  totalTerraTokenEarned: 0
};

/**
 * @param {LegacyCompatiblePlayer[]} playersA
 * @param {LegacyCompatiblePlayer[]} playersB
 * @returns {string}
 * @see GR-PLAYER-1, GR-PLAYER-2, GR-PLAYER-3, GR-PLAYER-4 in docs/business-rules.md
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
    stringifyEntry({...NUMBER_FIELD_FALLBACKS, ...player, host: player.id === hostFromSaveA?.id})
  ).join('|\n');
}

