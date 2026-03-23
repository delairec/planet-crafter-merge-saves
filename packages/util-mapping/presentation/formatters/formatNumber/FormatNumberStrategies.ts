import {formatNumberByThresholds} from "./symbol.strategy";
import {formatDecimalNumber} from "./thousandsSeparator.strategy";

export const FormatNumberStrategies = {
  SYMBOL: formatNumberByThresholds,
  THOUSANDS_SEPARATOR: formatDecimalNumber
};
export type FormatNumberStrategy = typeof FormatNumberStrategies[keyof typeof FormatNumberStrategies];
