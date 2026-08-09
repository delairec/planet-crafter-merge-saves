import {formatDecimalNumberOptions} from "./formatNumberOptions";

export function formatDecimalNumber(value: number | bigint) {
  const locales = undefined;
  return new Intl.NumberFormat(locales, formatDecimalNumberOptions).format(Number(value));
}
