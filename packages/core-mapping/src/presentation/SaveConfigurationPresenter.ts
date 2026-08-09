import {SaveConfigurationPresenterPort} from "../application/ports/SaveConfigurationPresenterPort";
import {SaveConfigurationViewModel} from "./viewModels/SaveConfigurationViewModel";
import {SaveConfigurationValueObject} from "../domain/valueObjects/SaveConfigurationValueObject";
import {formatNumber} from "./formatters/formatNumber/formatNumber";
import {FormatNumberStrategies} from "./formatters/formatNumber/FormatNumberStrategies";

export class SaveConfigurationPresenter implements SaveConfigurationPresenterPort {
  viewModel: SaveConfigurationViewModel;

  /**{
   terraformationPace: number;
   gaugeDrain: number;
   meteoOccurrence: number;
   multiplayerFactor: number;
   powerConsumption: number;
   }*/
  constructor() {
    this.viewModel = {
      mode: '',
      title: '',
      modifiers: {
        columns: [
          {
            header: 'Terraformation Pace',
            values: []
          },
          {
            header: 'Gauge Drain',
            values: []
          },
          {
            header: 'Meteo Occurrence',
            values: []
          },
          {
            header: 'Multiplayer Factor',
            values: []
          },
          {
            header: 'Power Consumption',
            values: []
          }
        ]
      }
    };
  }

  present(saveConfiguration: SaveConfigurationValueObject): void {
    this.viewModel = {
      mode: saveConfiguration.mode,
      title: saveConfiguration.title,
      modifiers: {
        columns: [
          {
            header: 'Terraformation Pace',
            values: [formatNumber(saveConfiguration.modifiers.terraformationPace, FormatNumberStrategies.PERCENTAGE)]
          },
          {
            header: 'Gauge Drain',
            values: [formatNumber(saveConfiguration.modifiers.gaugeDrain, FormatNumberStrategies.PERCENTAGE)]
          },
          {
            header: 'Meteo Occurrence',
            values: [formatNumber(saveConfiguration.modifiers.meteoOccurrence, FormatNumberStrategies.PERCENTAGE)]
          },
          {
            header: 'Multiplayer Factor',
            values: [formatNumber(saveConfiguration.modifiers.multiplayerFactor, FormatNumberStrategies.PERCENTAGE)]
          },
          {
            header: 'Power Consumption',
            values: [formatNumber(saveConfiguration.modifiers.powerConsumption, FormatNumberStrategies.PERCENTAGE)]
          }
        ]
      }
    };
  }
}
