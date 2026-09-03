import {formatDecimalNumberWithSuffix} from "./formatDecimalNumberWithSuffix";

interface Threshold {
  value: number;
  suffix: string;
}

const thresholds: Threshold[] = [
  {value: 1_000_000_000_000, suffix: "K"},
  {value: 1_000_000_000, suffix: "mK"},
  {value: 1_000_000, suffix: "µK"},
  {value: 1_000, suffix: "nK"},
  {value: 1, suffix: "pK"},
];

export function formatNumberByKelvinThresholds(value: number|bigint) {
  const num = Number(value);

  for (const threshold of thresholds) {
    if (isNumberBiggerThanThreshold(num, threshold)) {
      const result = num / threshold.value;
      return formatDecimalNumberWithSuffix(result, threshold.suffix);
    }
  }

  return formatDecimalNumberWithSuffix(num, thresholds[4].suffix);
}

function isNumberBiggerThanThreshold(num: number, threshold: Threshold) {
  return num >= threshold.value;
}
