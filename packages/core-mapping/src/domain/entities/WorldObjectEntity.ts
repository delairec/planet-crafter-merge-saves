import type {WorldObjectName} from "../worldObjectNames.ts";
import {assertNonEmptyString} from "../errors/assertions.ts";

export interface WorldObjectEntity {
  readonly id: string;
  readonly name: WorldObjectName;
}

export function createWorldObjectEntity(input: WorldObjectEntity): WorldObjectEntity {
  return {
    id: assertNonEmptyString(input.id, 'WorldObjectEntity.id'),
    name: assertNonEmptyString(input.name, 'WorldObjectEntity.name') as WorldObjectName
  };
}
