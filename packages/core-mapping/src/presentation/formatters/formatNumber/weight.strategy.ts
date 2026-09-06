import {formatNumberByThresholds, type Threshold} from "./threshold.strategy.ts";

const thresholds: Threshold[] = [
  {value: 1_000_000_000_000_000, suffix: "Gt"},
  {value: 1_000_000_000_000, suffix: "Mt"},
  {value: 1_000_000_000, suffix: "kt"},
  {value: 1_000_000, suffix: "t"},
  {value: 1_000, suffix: "kg"},
  {value: 1, suffix: "g"},
];

export function formatNumberByWeightThresholds(value: number | bigint) {
  return formatNumberByThresholds(value, thresholds);
}
