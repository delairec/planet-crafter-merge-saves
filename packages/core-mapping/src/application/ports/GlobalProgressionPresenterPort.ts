import {GlobalProgressionValueObject} from "../../domain/valueObjects/GlobalProgressionValueObject";
import {StatisticsValueObject} from "../../domain/valueObjects/StatisticsValueObject";

export interface GlobalProgressionPresenterPort {
  displayGlobalProgression(metadata: GlobalProgressionValueObject, statistics: StatisticsValueObject | undefined): void;
}
