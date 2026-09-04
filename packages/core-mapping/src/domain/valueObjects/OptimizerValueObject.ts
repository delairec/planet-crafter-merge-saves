import {OptimizerBoostedMachineValueObject} from "./OptimizerBoostedMachineValueObject";
import {WorldObjectName} from "../worldObjectNames";
import {assertArray, assertFiniteNumber, assertNonEmptyString, assertOptionalFiniteNumber} from "../errors/assertions";

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
