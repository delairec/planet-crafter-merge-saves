import {WorldObjectName} from "../worldObjectNames";
import {assertFiniteNumber, assertNonEmptyString, assertOptionalFiniteNumber} from "../errors/assertions";

// Represents a world object placed in the game world (has a position and belongs to a planet),
// as opposed to `WorldObjectEntity`, which only carries identity/name and is used for
// inventory/equipment labeling where placement is irrelevant.
export interface PlacedWorldObjectEntity {
  readonly id: string;
  readonly name: WorldObjectName;
  readonly position: readonly [number, number, number];
  readonly planetId: number;
  readonly inventoryId?: number;
}

export function createPlacedWorldObjectEntity(input: PlacedWorldObjectEntity): PlacedWorldObjectEntity {
  const [x, y, z] = input.position;

  return {
    id: assertNonEmptyString(input.id, 'PlacedWorldObjectEntity.id'),
    name: assertNonEmptyString(input.name, 'PlacedWorldObjectEntity.name') as WorldObjectName,
    position: [
      assertFiniteNumber(x, 'PlacedWorldObjectEntity.position[0]'),
      assertFiniteNumber(y, 'PlacedWorldObjectEntity.position[1]'),
      assertFiniteNumber(z, 'PlacedWorldObjectEntity.position[2]')
    ],
    planetId: assertFiniteNumber(input.planetId, 'PlacedWorldObjectEntity.planetId'),
    inventoryId: assertOptionalFiniteNumber(input.inventoryId, 'PlacedWorldObjectEntity.inventoryId')
  };
}
