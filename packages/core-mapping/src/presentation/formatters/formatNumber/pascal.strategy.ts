import {formatNumberByThresholds, type Threshold} from "./threshold.strategy.ts";

const thresholds: Threshold[] = [
  {value: 1_000_000_000, suffix: "Pa"},
  {value: 1_000_000, suffix: "mPa"},
  {value: 1_000, suffix: "µPa"},
  {value: 1, suffix: "nPa"},
];

export function formatNumberByPascalThresholds(value: number | bigint) {
  return formatNumberByThresholds(value, thresholds);
}
