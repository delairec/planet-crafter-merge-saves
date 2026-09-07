import {Inventory, WorldObject} from 'shared-save-processing/gameDefinitions';

/**
 * Source of the identifiers handed to the entries renumbered during conflict resolution.
 */
export interface IdSequence {
  next(): number;
}

interface IdentifiedEntry {
  readonly id: number;
}

const FIRST_ID = 1;

/**
 * Starts the sequence above the highest identifier of the merged save, taken across both sections
 * that share one numbering space: inventories and world objects. Seeding on the whole space before
 * a single identifier is handed out is what keeps a renumbered inventory off an existing world
 * object id.
 *
 * Player identifiers are left out on purpose: they are Steam identifiers beyond
 * `Number.MAX_SAFE_INTEGER`, on which `id + 1` returns `id`, and they share no numbering space with
 * inventories and world objects.
 *
 * @see GR-ID-1, GR-ID-2 in docs/game-rules.md
 */
export function createIdSequence(inventories: readonly Inventory[], worldObjects: readonly WorldObject[]): IdSequence {
  let nextId = Math.max(findHighestId(inventories), findHighestId(worldObjects)) + 1;

  return {next: () => nextId++};
}

function findHighestId(entries: readonly IdentifiedEntry[]): number {
  let highestId = FIRST_ID - 1;
  for (const entry of entries) {
    if (entry.id > highestId) {
      highestId = entry.id;
    }
  }

  return highestId;
}
