import {SaveConfigurationPresenterPort} from "../application/ports/SaveConfigurationPresenterPort";
import {SaveConfigurationViewModel} from "./viewModels/SaveConfigurationViewModel";
import {SaveConfigurationValueObject} from "../domain/valueObjects/SaveConfigurationValueObject";
import {formatNumber} from "./formatters/formatNumber/formatNumber";
import {FormatNumberStrategies} from "./formatters/formatNumber/FormatNumberStrategies";
import {
  saveConfigurationSectionGaugeDrainLabel,
  saveConfigurationSectionMeteoOccurrenceLabel,
  saveConfigurationSectionMultiplayerFactorLabel,
  saveConfigurationSectionPowerConsumptionLabel,
  saveConfigurationSectionTerraformationPaceLabel
} from "./messages/saveConfigurationSectionMessages.js";

export class SaveConfigurationPresenter implements SaveConfigurationPresenterPort {
  viewModel: SaveConfigurationViewModel;

  constructor() {
    this.viewModel = {
      mode: '',
      title: '',
      modifiers: {
        columns: [
          {
            header: saveConfigurationSectionTerraformationPaceLabel,
            values: []
          },
          {
            header: saveConfigurationSectionGaugeDrainLabel,
            values: []
          },
          {
            header: saveConfigurationSectionMeteoOccurrenceLabel,
            values: []
          },
          {
            header: saveConfigurationSectionMultiplayerFactorLabel,
            values: []
          },
          {
            header: saveConfigurationSectionPowerConsumptionLabel,
            values: []
          }
        ]
      }
    };
  }

  displaySaveConfiguration(saveConfiguration: SaveConfigurationValueObject): void {
    this.viewModel = {
      mode: saveConfiguration.mode,
      title: saveConfiguration.title,
      modifiers: {
        columns: [
          {
            header: saveConfigurationSectionTerraformationPaceLabel,
            values: [formatNumber(saveConfiguration.modifiers.terraformationPace, FormatNumberStrategies.PERCENTAGE)]
          },
          {
            header: saveConfigurationSectionGaugeDrainLabel,
            values: [formatNumber(saveConfiguration.modifiers.gaugeDrain, FormatNumberStrategies.PERCENTAGE)]
          },
          {
            header: saveConfigurationSectionMeteoOccurrenceLabel,
            values: [formatNumber(saveConfiguration.modifiers.meteoOccurrence, FormatNumberStrategies.PERCENTAGE)]
          },
          {
            header: saveConfigurationSectionMultiplayerFactorLabel,
            values: [formatNumber(saveConfiguration.modifiers.multiplayerFactor, FormatNumberStrategies.PERCENTAGE)]
          },
          {
            header: saveConfigurationSectionPowerConsumptionLabel,
            values: [formatNumber(saveConfiguration.modifiers.powerConsumption, FormatNumberStrategies.PERCENTAGE)]
          }
        ]
      }
    };
  }
}
