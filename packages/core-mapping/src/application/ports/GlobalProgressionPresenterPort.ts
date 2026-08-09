import {GlobalProgressionValueObject} from "../../domain/valueObjects/GlobalProgressionValueObject";
import {StatisticsValueObject} from "../../domain/valueObjects/StatisticsValueObject";

export interface GlobalProgressionPresenterPort {
  present(metadata: GlobalProgressionValueObject, statistics: StatisticsValueObject): void;
}
