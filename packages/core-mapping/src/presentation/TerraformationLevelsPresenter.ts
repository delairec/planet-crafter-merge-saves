import type {TerraformationLevelsViewModel} from "./viewModels/TerraformationLevelsViewModel.ts";
import type {TerraformationLevelSummaryValueObject} from "../domain/valueObjects/TerraformationLevelSummaryValueObject.ts";
import type {TerraformationLevelsPresenterPort} from "../application/ports/TerraformationLevelsPresenterPort.ts";
import {formatNumber} from "./formatters/formatNumber/formatNumber.ts";
import {FormatNumberStrategies} from "./formatters/formatNumber/FormatNumberStrategies.ts";
import {
  terraformationLevelsSectionAnimalsLabel,
  terraformationLevelsSectionDefaultPlanetName,
  terraformationLevelsSectionHeatLabel,
  terraformationLevelsSectionInsectsLabel,
  terraformationLevelsSectionOxygenLabel,
  terraformationLevelsSectionPlantsLabel,
  terraformationLevelsSectionPressureLabel,
  terraformationLevelsSectionPurificationLabel
} from "./messages/terraformationLevelsSectionMessages.js";

export class TerraformationLevelsPresenter implements TerraformationLevelsPresenterPort {
  private _viewModel: TerraformationLevelsViewModel;

  constructor() {
    this._viewModel = {
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

  get viewModel(): TerraformationLevelsViewModel {
    return this._viewModel;
  }

  displayTerraformationLevels(levels: TerraformationLevelSummaryValueObject[]): void {
    this._viewModel = {
      planets: levels.map(level => ({
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
        terraformationIndex: formatNumber(level.terraformationIndex, FormatNumberStrategies.SYMBOL) + 'Ti',
        biomass: formatNumber(level.biomass, FormatNumberStrategies.WEIGHT)
      }))
    };
  }
}
