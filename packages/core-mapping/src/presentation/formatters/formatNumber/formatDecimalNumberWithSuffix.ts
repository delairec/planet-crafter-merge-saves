import {formatDecimalNumber} from "./thousandsSeparator.strategy.ts";

const nbsp = ' ';

export function formatDecimalNumberWithSuffix(value: number, suffix: string): string {
  return `${formatDecimalNumber(value)}${nbsp}${suffix}`;
}
