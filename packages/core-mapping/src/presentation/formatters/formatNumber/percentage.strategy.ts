import {formatPercentageNumberOptions} from "./formatNumberOptions.ts";

export function formatPercentageNumber(value: number | bigint) {
  const locales = undefined;
  return new Intl.NumberFormat(locales, formatPercentageNumberOptions).format(Number(value));
}
