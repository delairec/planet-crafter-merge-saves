import {assertFiniteNumber} from "../errors/assertions.ts";

export interface GlobalProgressionValueObject {
  readonly allTimeTerraTokens: number;
}

export function createGlobalProgressionValueObject(input: GlobalProgressionValueObject): GlobalProgressionValueObject {
  return {
    allTimeTerraTokens: assertFiniteNumber(input.allTimeTerraTokens, 'GlobalProgressionValueObject.allTimeTerraTokens')
  };
}
