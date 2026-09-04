import {assertArray, assertNonEmptyString} from "../errors/assertions";

export interface PlayerEntity {
  readonly name: string;
  readonly inventory: readonly string[];
  readonly equipment: readonly string[];
}

export function createPlayerEntity(input: PlayerEntity): PlayerEntity {
  return {
    name: assertNonEmptyString(input.name, 'PlayerEntity.name'),
    inventory: assertArray<unknown>(input.inventory, 'PlayerEntity.inventory')
      .map((item, index) => assertNonEmptyString(item, `PlayerEntity.inventory[${index}]`)),
    equipment: assertArray<unknown>(input.equipment, 'PlayerEntity.equipment')
      .map((item, index) => assertNonEmptyString(item, `PlayerEntity.equipment[${index}]`))
  };
}
