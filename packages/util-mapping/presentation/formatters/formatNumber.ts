interface Threshold {
  value: number | bigint;
  suffix: string;
  big?: boolean;
  multiply?: number;
}

const thresholds: Threshold[] = [
  { value: 1_000_000_000_000_000_000_000_000n, suffix: "Y", big: true },
  { value: 1_000_000_000_000_000_000_000n, suffix: "Z", big: true },
  { value: 1_000_000_000_000_000_000n, suffix: "E", big: true },
  { value: 1_000_000_000_000_000, suffix: "P" },
  { value: 1_000_000_000_000, suffix: "T" },
  { value: 1_000_000_000, suffix: "G" },
  { value: 1_000_000, suffix: "M" },
  { value: 1_000, suffix: "k" },
  { value: 1, suffix: "" },
  { value: 0.001, suffix: "" },
  { value: 0.000_001, suffix: "µ", multiply: 1_000_000 },
  { value: 0.000_000_001, suffix: "n", multiply: 1_000_000_000 },
];

export function formatNumber(num: number) {
  for (const threshold of thresholds) {
    if(isBigInteger(num, threshold)){
      const quotient = BigInt(num) / BigInt(threshold.value);
      const result = Number(quotient);
      return formatNumberWithSymbol(result, threshold);
    }

    if(isNumber(num, threshold) && !isBigIntType(threshold.value)){
      if(!threshold.suffix){
        return formatNumberWithoutSymbol(num);
      }
      if(threshold.multiply){
        const result = num * threshold.multiply;
        return formatNumberWithSymbol(result, threshold);
      }

      const result = num / threshold.value;
      return formatNumberWithSymbol(result, threshold);
    }
  }

  return formatNumberWithoutSymbol(num);
}

function formatNumberWithoutSymbol(value: number) {
  return new Intl.NumberFormat().format(value);
}

function formatNumberWithSymbol(value: number, t:Threshold) {
  return `${(formatNumberWithoutSymbol(value))}${t.suffix}`;
}

function isBigIntType(num: number | bigint): num is bigint {
  return typeof num === 'bigint';
}

function isBigInteger(num: number, threshold: Threshold) {
  const isBig = isBigIntType(num) || Number(num) > 999_999_999_999_999;
  return isBig && BigInt(num) >= threshold.value;
}

function isNumber(num: number, threshold: Threshold) {
  return !isBigIntType(num) && num >= threshold.value;
}
