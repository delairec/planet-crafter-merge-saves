import {formatNumberByThresholds, Threshold} from "./threshold.strategy";

const thresholds: Threshold[] = [
  {value: 1_000_000_000_000, suffix: "ppk"},
  {value: 1_000_000_000, suffix: "ppm"},
  {value: 1_000_000, suffix: "ppb"},
  {value: 1_000, suffix: "ppt"},
  {value: 1, suffix: "ppq"},
];

export function formatNumberByPartsPerThresholds(value: number | bigint) {
  return formatNumberByThresholds(value, thresholds);
}
