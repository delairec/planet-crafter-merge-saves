import {TerraformationLevelsViewModel} from "./viewModels/TerraformationLevelsViewModel";
import {TerraformationLevel} from "../../util-types/gameDefinitions";
import {formatNumber} from "./formatters/formatNumber";

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
            values: [formatNumber(level.unitOxygenLevel)]
          },
          {
            header: 'Heat',
            values: [formatNumber(level.unitHeatLevel)]
          },
          {
            header: 'Pressure',
            values: [formatNumber(level.unitPressureLevel)]
          },
          {
            header: 'Purification',
            values: [formatNumber(level.unitPurificationLevel)]
          }
        ]
      },
      organicLevels: {
        columns: [
          {
            header: 'Plants',
            values: [formatNumber(level.unitPlantsLevel)]
          },
          {
            header: 'Insects',
            values: [formatNumber(level.unitInsectsLevel)]
          },
          {
            header: 'Animals',
            values: [formatNumber(level.unitAnimalsLevel)]
          },
        ]
      }
    }));
  }
}
