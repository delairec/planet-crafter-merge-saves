import {SaveConfigurationValueObject} from "../../domain/valueObjects/SaveConfigurationValueObject";

export interface SaveConfigurationPresenterPort {
  present(saveConfiguration: SaveConfigurationValueObject): void;
}
