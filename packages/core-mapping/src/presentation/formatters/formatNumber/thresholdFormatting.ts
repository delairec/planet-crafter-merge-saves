import {formatDecimalNumberWithSuffix} from "./formatDecimalNumberWithSuffix";

export interface Threshold {
  value: number;
  suffix: string;
}

export function formatNumberByThresholds(value: number | bigint, thresholds: Threshold[]): string {
  const num = Number(value);

  for (const threshold of thresholds) {
    if (num >= threshold.value) {
      const result = num / threshold.value;
      return formatDecimalNumberWithSuffix(result, threshold.suffix);
    }
  }

  const smallestThreshold = thresholds[thresholds.length - 1];
  return formatDecimalNumberWithSuffix(num, smallestThreshold.suffix);
}
