import {formatNumberByThresholds} from "./symbol.strategy";
import {formatDecimalNumber} from "./thousandsSeparator.strategy";
import {formatPercentageNumber} from "./percentage.strategy";

export const FormatNumberStrategies = {
  SYMBOL: formatNumberByThresholds,
  THOUSANDS_SEPARATOR: formatDecimalNumber,
  PERCENTAGE: formatPercentageNumber
};
export type FormatNumberStrategy = typeof FormatNumberStrategies[keyof typeof FormatNumberStrategies];
