import type {OptimizerBoostedMachineValueObject} from "./OptimizerBoostedMachineValueObject.ts";
import type {WorldObjectName} from "../worldObjectNames.ts";
import {assertArray, assertFiniteNumber, assertNonEmptyString, assertOptionalFiniteNumber} from "../errors/assertions.ts";

export interface OptimizerValueObject {
  readonly name: WorldObjectName;
  readonly fuseCount: number;
  readonly boostedMachines: readonly OptimizerBoostedMachineValueObject[];
  readonly contribution: number;
  readonly productionRatio?: number;
}

export function createOptimizerValueObject(input: OptimizerValueObject): OptimizerValueObject {
  return {
    name: assertNonEmptyString(input.name, 'OptimizerValueObject.name') as WorldObjectName,
    fuseCount: assertFiniteNumber(input.fuseCount, 'OptimizerValueObject.fuseCount'),
    boostedMachines: assertArray<OptimizerBoostedMachineValueObject>(input.boostedMachines, 'OptimizerValueObject.boostedMachines'),
    contribution: assertFiniteNumber(input.contribution, 'OptimizerValueObject.contribution'),
    productionRatio: assertOptionalFiniteNumber(input.productionRatio, 'OptimizerValueObject.productionRatio')
  };
}
