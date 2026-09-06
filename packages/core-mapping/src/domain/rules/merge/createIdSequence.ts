import {Inventory} from 'shared-save-processing/gameDefinitions';

/**
 * Source of the identifiers handed to the entries renumbered during conflict resolution.
 * `reserve` keeps the sequence above an identifier that is already in use.
 */
export interface IdSequence {
  next(): number;
  reserve(id: number): void;
}

const FIRST_ID = 1;

/**
 * Starts the sequence above the highest inventory identifier of the merged save.
 *
 * World object identifiers are not part of the seed: they are reserved one by one while the world
 * objects are walked. See T16 for the collision this leaves open.
 *
 * @see GR-ID-2 in docs/game-rules.md
 */
export function createIdSequence(inventories: readonly Inventory[]): IdSequence {
  let nextId = FIRST_ID;
  const reserve = (id: number) => {
    if (id >= nextId) {
      nextId = id + 1;
    }
  };

  for (const inventory of inventories) {
    reserve(inventory.id);
  }

  return {
    next: () => nextId++,
    reserve
  };
}
