import type {GlobalProgressionValueObject} from "../../domain/valueObjects/GlobalProgressionValueObject.ts";
import type {StatisticsValueObject} from "../../domain/valueObjects/StatisticsValueObject.ts";

export interface GlobalProgressionPresenterPort {
  displayGlobalProgression(metadata: GlobalProgressionValueObject, statistics: StatisticsValueObject | undefined): void;
}
