import type {SaveConfigurationValueObject} from "../../domain/valueObjects/SaveConfigurationValueObject.ts";

export interface SaveConfigurationPresenterPort {
  displaySaveConfiguration(saveConfiguration: SaveConfigurationValueObject | undefined): void;
}
