import type {Player} from "shared-save-processing/gameDefinitions";
import type {ValidationIssue} from "../../application/ports/ValidationIssue.ts";

/** A valid multiplayer save must designate exactly one player as the host. */
export function validateUniqueHost(players: Player[] | undefined): ValidationIssue[] {
  if (!players || players.length === 0) return [];

  const hosts = players.filter(player => player.host === true);
  if (hosts.length === 1) return [];

  return [{
    code: 'unique-host',
    detail: `Expected exactly one host player, found ${hosts.length}`
  }];
}
