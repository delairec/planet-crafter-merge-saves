import {formatDecimalNumberOptions} from "./formatNumberOptions";

interface Threshold {
  value: number | bigint;
  suffix: string;
  big?: boolean;
  multiply?: number;
}

const thresholds: Threshold[] = [
  {value: 1_000_000_000_000_000_000_000_000n, suffix: "Y", big: true},
  {value: 1_000_000_000_000_000_000_000n, suffix: "Z", big: true},
  {value: 1_000_000_000_000_000_000n, suffix: "E", big: true},
  {value: 1_000_000_000_000_000, suffix: "P"},
  {value: 1_000_000_000_000, suffix: "T"},
  {value: 1_000_000_000, suffix: "G"},
  {value: 1_000_000, suffix: "M"},
  {value: 1_000, suffix: "k"},
  {value: 1, suffix: ""},
  {value: 0.001, suffix: ""},
  {value: 0.000_001, suffix: "µ", multiply: 1_000_000},
  {value: 0.000_000_001, suffix: "n", multiply: 1_000_000_000},
];

export function formatNumberByUnitThresholds(numberOrBigint: number | bigint) {
  const num = isBigIntType(numberOrBigint) ? Number(numberOrBigint) : numberOrBigint;
  const bigNum = isBigIntType(numberOrBigint) ? numberOrBigint : null;

  for (const threshold of thresholds) {
    if (bigNum && isBigIntegerBiggerThanThreshold(bigNum, threshold)) {
      return formatBigIntegerWithSymbol(bigNum, threshold);
    }

    if (isNumberBiggerThanThreshold(num, threshold) && !isBigIntType(threshold.value)) {
      if (!threshold.suffix) {
        return formatDecimalNumber(num);
      }
      if (threshold.multiply) {
        const result = num * threshold.multiply;
        return formatDecimalNumberWithSymbol(result, threshold);
      }

      const result = num / threshold.value;
      return formatDecimalNumberWithSymbol(result, threshold);
    }
  }

  return formatDecimalNumber(num);
}

function formatBigIntegerWithSymbol(bigNum: bigint, threshold: Threshold) {
  const quotient = bigNum / BigInt(threshold.value);
  const result = Number(quotient);
  return formatDecimalNumberWithSymbol(result, threshold);
}

function formatDecimalNumberWithSymbol(value: number, t: Threshold) {
  return `${(formatDecimalNumber(value))}${t.suffix}`;
}

function isBigIntType(num: number | bigint): num is bigint {
  return typeof num === 'bigint';
}

function isBigIntegerBiggerThanThreshold(num: bigint, threshold: Threshold) {
  return num >= threshold.value;
}

function isNumberBiggerThanThreshold(num: number, threshold: Threshold) {
  return !isBigIntType(num) && num >= threshold.value;
}

function formatDecimalNumber(value: number) {
  const locales = undefined;
  return new Intl.NumberFormat(locales, formatDecimalNumberOptions).format(value);
}
