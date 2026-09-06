import {formatNumberByUnitThresholds} from "./symbol.strategy.ts";
import {formatDecimalNumber} from "./thousandsSeparator.strategy.ts";
import {formatPercentageNumber} from "./percentage.strategy.ts";
import {formatNumberByPartsPerThresholds} from "./partsPer.strategy.ts";
import {formatNumberByKelvinThresholds} from "./kelvin.strategy.ts";
import {formatNumberByPascalThresholds} from "./pascal.strategy.ts";
import {formatNumberByWeightThresholds} from "./weight.strategy.ts";

export const FormatNumberStrategies: Record<string, (value:number|bigint) => string> = {
  SYMBOL: formatNumberByUnitThresholds,
  THOUSANDS_SEPARATOR: formatDecimalNumber,
  PERCENTAGE: formatPercentageNumber,
  PARTS_PER: formatNumberByPartsPerThresholds,
  KELVIN: formatNumberByKelvinThresholds,
  PASCAL: formatNumberByPascalThresholds,
  WEIGHT: formatNumberByWeightThresholds,
};
export type FormatNumberStrategy = typeof FormatNumberStrategies[keyof typeof FormatNumberStrategies];
