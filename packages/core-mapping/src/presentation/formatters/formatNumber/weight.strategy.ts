import {formatDecimalNumberWithSuffix} from "./formatDecimalNumberWithSuffix";

interface Threshold {
  value: number;
  suffix: string;
}

const thresholds: Threshold[] = [
  {value: 1_000_000_000_000_000, suffix: "Gt"},
  {value: 1_000_000_000_000, suffix: "Mt"},
  {value: 1_000_000_000, suffix: "kt"},
  {value: 1_000_000, suffix: "t"},
  {value: 1_000, suffix: "kg"},
  {value: 1, suffix: "g"},
];

export function formatNumberByWeightThresholds(value: number|bigint) {
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
