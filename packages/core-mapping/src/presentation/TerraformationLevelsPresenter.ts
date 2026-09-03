import {TerraformationLevelsViewModel} from "./viewModels/TerraformationLevelsViewModel";
import {TerraformationLevelEntity} from "../domain/entities/TerraformationLevelEntity";
import {TerraformationLevelsPresenterPort} from "../application/ports/TerraformationLevelsPresenterPort";
import {computeTerraformationSummary} from "../domain/rules/computeTerraformationSummary";
import {formatNumber} from "./formatters/formatNumber/formatNumber";
import {FormatNumberStrategies} from "./formatters/formatNumber/FormatNumberStrategies";
import {
  terraformationLevelsSectionAnimalsLabel,
  terraformationLevelsSectionDefaultPlanetName,
  terraformationLevelsSectionHeatLabel,
  terraformationLevelsSectionInsectsLabel,
  terraformationLevelsSectionOxygenLabel,
  terraformationLevelsSectionPlantsLabel,
  terraformationLevelsSectionPressureLabel,
  terraformationLevelsSectionPurificationLabel
} from "util-messages/terraformationLevelsSectionMessages.js";

export class TerraformationLevelsPresenter implements TerraformationLevelsPresenterPort {
  viewModel: TerraformationLevelsViewModel;

  constructor() {
    this.viewModel = {
      planets: [
        {
          name: terraformationLevelsSectionDefaultPlanetName,
          environmentalLevels: {
            columns: [
              {
                header: terraformationLevelsSectionOxygenLabel,
                values: []
              },
              {
                header: terraformationLevelsSectionHeatLabel,
                values: []
              },
              {
                header: terraformationLevelsSectionPressureLabel,
                values: []
              },
              {
                header: terraformationLevelsSectionPurificationLabel,
                values: []
              }
            ]
          },
          organicLevels: {
            columns: [
              {
                header: terraformationLevelsSectionPlantsLabel,
                values: []
              },
              {
                header: terraformationLevelsSectionInsectsLabel,
                values: []
              },
              {
                header: terraformationLevelsSectionAnimalsLabel,
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

  displayTerraformationLevels(levels: TerraformationLevelEntity[]): void {
    this.viewModel.planets = levels.map(level => {
      const summary = computeTerraformationSummary(level);

      return {
        name: level.planetId,
        environmentalLevels: {
          columns: [
            {
              header: terraformationLevelsSectionOxygenLabel,
              values: [formatNumber(level.unitOxygenLevel, FormatNumberStrategies.PARTS_PER)]
            },
            {
              header: terraformationLevelsSectionHeatLabel,
              values: [formatNumber(level.unitHeatLevel, FormatNumberStrategies.KELVIN)]
            },
            {
              header: terraformationLevelsSectionPressureLabel,
              values: [formatNumber(level.unitPressureLevel, FormatNumberStrategies.PASCAL)]
            },
            {
              header: terraformationLevelsSectionPurificationLabel,
              values: [formatNumber(level.unitPurificationLevel, FormatNumberStrategies.SYMBOL) + 'Pu']
            }
          ]
        },
        organicLevels: {
          columns: [
            {
              header: terraformationLevelsSectionPlantsLabel,
              values: [formatNumber(level.unitPlantsLevel, FormatNumberStrategies.WEIGHT)]
            },
            {
              header: terraformationLevelsSectionInsectsLabel,
              values: [formatNumber(level.unitInsectsLevel, FormatNumberStrategies.WEIGHT)]
            },
            {
              header: terraformationLevelsSectionAnimalsLabel,
              values: [formatNumber(level.unitAnimalsLevel, FormatNumberStrategies.WEIGHT)]
            },
          ]
        },
        terraformationIndex: formatNumber(summary.terraformationIndex, FormatNumberStrategies.SYMBOL) + 'Ti',
        biomass: formatNumber(summary.biomass, FormatNumberStrategies.WEIGHT)
      };
    });
  }
}
