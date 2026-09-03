import {OptimizerBoostedMachineValueObject} from "./OptimizerBoostedMachineValueObject";
import {WorldObjectName} from "../worldObjectNames";

export interface OptimizerValueObject {
  name: WorldObjectName;
  fuseCount: number;
  boostedMachines: OptimizerBoostedMachineValueObject[];
  contribution: number;
}
