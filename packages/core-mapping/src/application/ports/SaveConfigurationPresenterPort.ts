import {SaveConfigurationValueObject} from "../../domain/valueObjects/SaveConfigurationValueObject";

export interface SaveConfigurationPresenterPort {
  displaySaveConfiguration(saveConfiguration: SaveConfigurationValueObject | undefined): void;
}
