import {formatDecimalNumberOptions} from "./formatNumberOptions";

interface Threshold {
  value: number;
  suffix: string;
}

const thresholds: Threshold[] = [
  {value: 1_000_000_000_000, suffix: "ppk"},
  {value: 1_000_000_000, suffix: "ppm"},
  {value: 1_000_000, suffix: "ppb"},
  {value: 1_000, suffix: "ppt"},
  {value: 1, suffix: "ppq"},
];

export function formatNumberByPartsPerThresholds(num: number) {
  for (const threshold of thresholds) {
    if (isNumberBiggerThanThreshold(num, threshold)) {
      const result = num / threshold.value;
      return formatDecimalNumberWithSymbol(result, threshold);
    }
  }

  return formatDecimalNumberWithSymbol(num, thresholds[4]);
}

function formatDecimalNumberWithSymbol(value: number, t: Threshold) {
  return `${(formatDecimalNumber(value))}${t.suffix}`;
}

function isNumberBiggerThanThreshold(num: number, threshold: Threshold) {
  return num >= threshold.value;
}

function formatDecimalNumber(value: number) {
  const locales = undefined;
  return new Intl.NumberFormat(locales, formatDecimalNumberOptions).format(value);
}
