import {WorldObjectName} from "../worldObjectNames";
import {assertFiniteNumber, assertNonEmptyString} from "../errors/assertions";

export interface OptimizerBoostedMachineValueObject {
  readonly name: WorldObjectName;
  readonly quantity: number;
}

export function createOptimizerBoostedMachineValueObject(input: OptimizerBoostedMachineValueObject): OptimizerBoostedMachineValueObject {
  return {
    name: assertNonEmptyString(input.name, 'OptimizerBoostedMachineValueObject.name') as WorldObjectName,
    quantity: assertFiniteNumber(input.quantity, 'OptimizerBoostedMachineValueObject.quantity')
  };
}
