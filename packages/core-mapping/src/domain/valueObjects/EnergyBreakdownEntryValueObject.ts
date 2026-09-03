import {WorldObjectName} from "../worldObjectNames";

export interface EnergyBreakdownEntryValueObject {
  name: WorldObjectName;
  quantity: number;
  unitLevel: number;
  totalLevel: number;
}
