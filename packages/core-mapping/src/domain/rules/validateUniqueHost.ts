import type {Player} from "shared-save-processing/gameDefinitions";
import {VALIDATION_ISSUE_CODES} from "../../application/ports/ValidationIssue.ts";
import type {ValidationIssue} from "../../application/ports/ValidationIssue.ts";

/** A valid multiplayer save must designate exactly one player as the host. */
export function validateUniqueHost(players: Player[] | undefined): ValidationIssue[] {
  if (!players || players.length === 0) return [];

  const hosts = players.filter(player => player.host === true);
  if (hosts.length === 1) return [];

  return [{
    code: VALIDATION_ISSUE_CODES.UNIQUE_HOST,
    detail: `Expected exactly one host player, found ${hosts.length}`
  }];
}
