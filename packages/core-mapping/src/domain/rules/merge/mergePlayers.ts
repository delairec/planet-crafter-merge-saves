import {Player} from 'shared-save-processing/gameDefinitions';
import {EntriesByOrigin} from './EntriesByOrigin';

type LegacyCompatiblePlayer = Omit<Player, 'cameraView' | 'totalCraftedObjects' | 'totalTerraTokenEarned'>
  & Partial<Pick<Player, 'cameraView' | 'totalCraftedObjects' | 'totalTerraTokenEarned'>>;

const NUMBER_FIELD_FALLBACKS = {
  cameraView: 0,
  totalCraftedObjects: 0,
  totalTerraTokenEarned: 0
};

const NO_HOST_POSITION = -1;

const applyHostAndFallbacks = (player: LegacyCompatiblePlayer, host: boolean): Player =>
  ({...NUMBER_FIELD_FALLBACKS, ...player, host});

/**
 * @see GR-PLAYER-1, GR-PLAYER-2, GR-PLAYER-3, GR-PLAYER-4 in docs/game-rules.md
 */
export function mergePlayers(playersA: LegacyCompatiblePlayer[], playersB: LegacyCompatiblePlayer[]): EntriesByOrigin<Player> {
  const playersFromBNotInA = playersB.filter(playerB =>
    !playersA.some(playerA => playerA.name === playerB.name)
  );

  const hostPositionInSaveA = playersA.findIndex(player => player.host);
  const hostPositionInSaveB = hostPositionInSaveA === NO_HOST_POSITION
    ? playersFromBNotInA.findIndex(player => player.host)
    : NO_HOST_POSITION;

  return {
    fromSaveA: playersA.map((player, position) => applyHostAndFallbacks(player, position === hostPositionInSaveA)),
    fromSaveB: playersFromBNotInA.map((player, position) => applyHostAndFallbacks(player, position === hostPositionInSaveB))
  };
}
