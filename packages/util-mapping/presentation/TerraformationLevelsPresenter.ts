import {TerraformationLevelsViewModel} from "./viewModels/TerraformationLevelsViewModel";
import {TerraformationLevel} from "../../util-types/gameDefinitions";
import {formatNumber, FormatNumberStrategies} from "./formatters/formatNumber";

export class TerraformationLevelsPresenter {
  viewModel: TerraformationLevelsViewModel;

  constructor() {
    this.viewModel = {
      planets: [
        {
          name: 'Planet',
          environmentalLevels: {
            columns: [
              {
                header: 'O²',
                values: []
              },
              {
                header: 'Heat',
                values: []
              },
              {
                header: 'Pressure',
                values: []
              },
              {
                header: 'Purification',
                values: []
              }
            ]
          },
          organicLevels: {
            columns: [
              {
                header: 'Plants',
                values: []
              },
              {
                header: 'Insects',
                values: []
              },
              {
                header: 'Animals',
                values: []
              },
            ]
          }
        }
      ]
    };
  }

  present(levels: TerraformationLevel[]): void {
    this.viewModel.planets = levels.map(level => ({
      name: level.planetId,
      environmentalLevels: {
        columns: [
          {
            header: 'O²',
            values: [formatNumber(level.unitOxygenLevel, FormatNumberStrategies.SYMBOL)]
          },
          {
            header: 'Heat',
            values: [formatNumber(level.unitHeatLevel, FormatNumberStrategies.SYMBOL)]
          },
          {
            header: 'Pressure',
            values: [formatNumber(level.unitPressureLevel, FormatNumberStrategies.SYMBOL)]
          },
          {
            header: 'Purification',
            values: [formatNumber(level.unitPurificationLevel, FormatNumberStrategies.SYMBOL)]
          }
        ]
      },
      organicLevels: {
        columns: [
          {
            header: 'Plants',
            values: [formatNumber(level.unitPlantsLevel, FormatNumberStrategies.SYMBOL)]
          },
          {
            header: 'Insects',
            values: [formatNumber(level.unitInsectsLevel, FormatNumberStrategies.SYMBOL)]
          },
          {
            header: 'Animals',
            values: [formatNumber(level.unitAnimalsLevel, FormatNumberStrategies.SYMBOL)]
          },
        ]
      }
    }));
  }
}
