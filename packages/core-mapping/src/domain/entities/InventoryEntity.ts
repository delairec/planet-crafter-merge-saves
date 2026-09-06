import {assertArray, assertFiniteNumber, assertNonEmptyString} from "../errors/assertions.ts";

export interface InventoryEntity {
  readonly id: number;
  readonly worldObjectIds: readonly string[];
  readonly size: number;
}

export function createInventoryEntity(input: InventoryEntity): InventoryEntity {
  const worldObjectIds = assertArray<unknown>(input.worldObjectIds, 'InventoryEntity.worldObjectIds')
    .map((worldObjectId, index) => assertNonEmptyString(worldObjectId, `InventoryEntity.worldObjectIds[${index}]`));

  return {
    id: assertFiniteNumber(input.id, 'InventoryEntity.id'),
    worldObjectIds,
    size: assertFiniteNumber(input.size, 'InventoryEntity.size')
  };
}
