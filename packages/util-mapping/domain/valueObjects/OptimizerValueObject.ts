import {OptimizerBoostedMachineValueObject} from "./OptimizerBoostedMachineValueObject";

export interface OptimizerValueObject {
  label: string;
  fuseCount: number;
  boostedMachines: OptimizerBoostedMachineValueObject[];
  contribution: number;
}
