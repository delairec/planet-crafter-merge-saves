import {formatDecimalNumberOptions} from "./formatNumberOptions";

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

export function formatNumberByKelvinThresholds(num: number) {
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
