import {formatDecimalNumberWithSuffix} from "./formatDecimalNumberWithSuffix";

interface Threshold {
  value: number;
  suffix: string;
}

const thresholds: Threshold[] = [
  {value: 1_000_000_000, suffix: "Pa"},
  {value: 1_000_000, suffix: "mPa"},
  {value: 1_000, suffix: "µPa"},
  {value: 1, suffix: "nPa"},
];

export function formatNumberByPascalThresholds(value: number|bigint) {
  const num = Number(value);

  for (const threshold of thresholds) {
    if (isNumberBiggerThanThreshold(num * 0.001, threshold)) {
      const result = num / threshold.value;
      return formatDecimalNumberWithSuffix(result, threshold.suffix);
    }
  }

  return formatDecimalNumberWithSuffix(num, thresholds[3].suffix);
}

function isNumberBiggerThanThreshold(num: number, threshold: Threshold) {
  return num >= threshold.value;
}
