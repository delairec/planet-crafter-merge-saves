import {GlobalProgressionEntity} from "../../domain/GlobalProgressionEntity";

export interface GlobalProgressionPresenterPort {
  present(metadata: GlobalProgressionEntity): void;
}
