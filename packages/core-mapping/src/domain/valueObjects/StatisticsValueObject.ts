import {assertFiniteNumber} from "../errors/assertions";

export interface StatisticsValueObject {
  readonly totalCraftedObjects: number;
}

export function createStatisticsValueObject(input: StatisticsValueObject): StatisticsValueObject {
  return {
    totalCraftedObjects: assertFiniteNumber(input.totalCraftedObjects, 'StatisticsValueObject.totalCraftedObjects')
  };
}
