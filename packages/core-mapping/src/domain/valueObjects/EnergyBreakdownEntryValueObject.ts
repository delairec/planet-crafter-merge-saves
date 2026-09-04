import {WorldObjectName} from "../worldObjectNames";
import {assertFiniteNumber, assertNonEmptyString, assertOptionalFiniteNumber} from "../errors/assertions";

export interface EnergyBreakdownEntryValueObject {
  readonly name: WorldObjectName;
  readonly quantity: number;
  readonly unitLevel: number;
  readonly totalLevel: number;
  readonly productionRatio?: number;
}

export function createEnergyBreakdownEntryValueObject(input: EnergyBreakdownEntryValueObject): EnergyBreakdownEntryValueObject {
  return {
    name: assertNonEmptyString(input.name, 'EnergyBreakdownEntryValueObject.name') as WorldObjectName,
    quantity: assertFiniteNumber(input.quantity, 'EnergyBreakdownEntryValueObject.quantity'),
    unitLevel: assertFiniteNumber(input.unitLevel, 'EnergyBreakdownEntryValueObject.unitLevel'),
    totalLevel: assertFiniteNumber(input.totalLevel, 'EnergyBreakdownEntryValueObject.totalLevel'),
    productionRatio: assertOptionalFiniteNumber(input.productionRatio, 'EnergyBreakdownEntryValueObject.productionRatio')
  };
}
