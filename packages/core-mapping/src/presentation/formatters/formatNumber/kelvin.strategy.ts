import {formatNumberByThresholds, Threshold} from "./threshold.strategy";

const thresholds: Threshold[] = [
  {value: 1_000_000_000_000, suffix: "K"},
  {value: 1_000_000_000, suffix: "mK"},
  {value: 1_000_000, suffix: "µK"},
  {value: 1_000, suffix: "nK"},
  {value: 1, suffix: "pK"},
];

export function formatNumberByKelvinThresholds(value: number | bigint) {
  return formatNumberByThresholds(value, thresholds);
}
