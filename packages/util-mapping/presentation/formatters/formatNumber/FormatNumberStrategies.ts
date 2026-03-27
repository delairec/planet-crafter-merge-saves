import {formatNumberByUnitThresholds} from "./symbol.strategy";
import {formatDecimalNumber} from "./thousandsSeparator.strategy";
import {formatPercentageNumber} from "./percentage.strategy";
import {formatNumberByPartsPerThresholds} from "./partsPer.strategy";
import {formatNumberByKelvinThresholds} from "./kelvin.strategy";
import {formatNumberByPascalThresholds} from "./pascal.strategy";

export const FormatNumberStrategies = {
  SYMBOL: formatNumberByUnitThresholds,
  THOUSANDS_SEPARATOR: formatDecimalNumber,
  PERCENTAGE: formatPercentageNumber,
  PARTS_PER: formatNumberByPartsPerThresholds,
  KELVIN: formatNumberByKelvinThresholds,
  PASCAL: formatNumberByPascalThresholds,
};
export type FormatNumberStrategy = typeof FormatNumberStrategies[keyof typeof FormatNumberStrategies];
