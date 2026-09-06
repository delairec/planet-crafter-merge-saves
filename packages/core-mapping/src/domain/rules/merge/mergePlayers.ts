import {Player} from 'shared-save-processing/gameDefinitions';
import {EntriesByOrigin} from './EntriesByOrigin';

type LegacyCompatiblePlayer = Omit<Player, 'cameraView' | 'totalCraftedObjects' | 'totalTerraTokenEarned'>
  & Partial<Pick<Player, 'cameraView' | 'totalCraftedObjects' | 'totalTerraTokenEarned'>>;

const NUMBER_FIELD_FALLBACKS = {
  cameraView: 0,
  totalCraftedObjects: 0,
  totalTerraTokenEarned: 0
};

/**
 * @see GR-PLAYER-1, GR-PLAYER-2, GR-PLAYER-3, GR-PLAYER-4 in docs/game-rules.md
 */
export function mergePlayers(playersA: LegacyCompatiblePlayer[], playersB: LegacyCompatiblePlayer[]): EntriesByOrigin<Player> {
  const hostFromSaveA = playersA.find(player => player.host);

  const playersFromBNotInA = playersB.filter(playerB =>
    !playersA.some(playerA => playerA.name === playerB.name)
  );

  const applyHostAndFallbacks = (player: LegacyCompatiblePlayer): Player =>
    ({...NUMBER_FIELD_FALLBACKS, ...player, host: player.id === hostFromSaveA?.id});

  return {
    fromSaveA: playersA.map(applyHostAndFallbacks),
    fromSaveB: playersFromBNotInA.map(applyHostAndFallbacks)
  };
}
