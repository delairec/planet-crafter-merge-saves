import {GlobalProgressionValueObject} from "../../domain/valueObjects/GlobalProgressionValueObject";

export interface GlobalProgressionPresenterPort {
  present(metadata: GlobalProgressionValueObject): void;
}
