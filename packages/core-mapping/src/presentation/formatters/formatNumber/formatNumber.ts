import {FormatNumberStrategies, type FormatNumberStrategy} from "./FormatNumberStrategies.ts";

export function formatNumber(numberOrBigint: number|bigint, strategy?:FormatNumberStrategy) {
  if(strategy){
    return strategy(numberOrBigint);
  }

  return FormatNumberStrategies.THOUSANDS_SEPARATOR(numberOrBigint);
}

