import {TerraformationLevelsViewModel} from "./viewModels/TerraformationLevelsViewModel";
import {TerraformationLevel} from "../../util-types/gameDefinitions";
import {formatNumber} from "./formatters/formatNumber/formatNumber";
import {FormatNumberStrategies} from "./formatters/formatNumber/FormatNumberStrategies";

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
          },
          terraformationIndex: '',
          biomass: ''
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
            values: [formatNumber(level.unitOxygenLevel, FormatNumberStrategies.PARTS_PER)]
          },
          {
            header: 'Heat',
            values: [formatNumber(level.unitHeatLevel, FormatNumberStrategies.KELVIN)]
          },
          {
            header: 'Pressure',
            values: [formatNumber(level.unitPressureLevel, FormatNumberStrategies.PASCAL)]
          },
          {
            header: 'Purification',
            values: [formatNumber(level.unitPurificationLevel, FormatNumberStrategies.SYMBOL) + 'Pu']
          }
        ]
      },
      organicLevels: {
        columns: [
          {
            header: 'Plants',
            values: [formatNumber(level.unitPlantsLevel, FormatNumberStrategies.WEIGHT)]
          },
          {
            header: 'Insects',
            values: [formatNumber(level.unitInsectsLevel, FormatNumberStrategies.WEIGHT)]
          },
          {
            header: 'Animals',
            values: [formatNumber(level.unitAnimalsLevel, FormatNumberStrategies.WEIGHT)]
          },
        ]
      },
      terraformationIndex: formatNumber(this.computeTerraformationIndex(level), FormatNumberStrategies.SYMBOL) + 'Ti',
      biomass: formatNumber(this.computeBiomass(level), FormatNumberStrategies.WEIGHT)
    }));
  }

  private computeTerraformationIndex(level: TerraformationLevel) {
    const totalEnvironmental = level.unitOxygenLevel + level.unitHeatLevel + level.unitPressureLevel + level.unitPurificationLevel;
    const totalOrganic = this.computeBiomass(level);
    return totalEnvironmental + totalOrganic;
  }

  private computeBiomass(level: TerraformationLevel) {
    return level.unitPlantsLevel + level.unitInsectsLevel + level.unitAnimalsLevel;
  }
}
