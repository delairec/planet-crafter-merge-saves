import {describe, expect, it} from 'bun:test';
import {TerraformationLevelsPresenter} from './TerraformationLevelsPresenter.ts';
import type {TerraformationLevelsViewModel} from './viewModels/TerraformationLevelsViewModel.ts';

const nbsp = '\u00A0';

describe('TerraformationLevelsPresenter', () => {
  it('should initialize with default view model', () => {
    // Act
    const presenter = new TerraformationLevelsPresenter();

    // Assert
    expect(presenter.viewModel).toEqual<TerraformationLevelsViewModel>({
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
      ],
    });
  });

  it('should present all terraformation levels', () => {
    // Arrange
    const presenter = new TerraformationLevelsPresenter();

    // Act
    presenter.displayTerraformationLevels([
      {
        planetId: "Earth",
        unitOxygenLevel: 123123,
        unitHeatLevel: 456456,
        unitPressureLevel: 789789,
        unitPlantsLevel: 101101,
        unitInsectsLevel: 112112,
        unitAnimalsLevel: 131131,
        unitPurificationLevel: 415415,
        terraformationIndex: 2_129_127,
        biomass: 344_344
      }
    ]);

    // Assert
    expect(presenter.viewModel).toEqual<TerraformationLevelsViewModel>({
      planets: [
        {
          name: 'Earth',
          environmentalLevels: {
            columns: [
              {
                header: 'O²',
                values: [`123.123${nbsp}ppt`]
              },
              {
                header: 'Heat',
                values: [`456.456${nbsp}nK`]
              },
              {
                header: 'Pressure',
                values: [`789.789${nbsp}µPa`]
              },
              {
                header: 'Purification',
                values: [`415.415${nbsp}kPu`]
              }
            ]
          },
          organicLevels: {
            columns: [
              {
                header: 'Plants',
                values: [`101.101${nbsp}kg`]
              },
              {
                header: 'Insects',
                values: [`112.112${nbsp}kg`]
              },
              {
                header: 'Animals',
                values: [`131.131${nbsp}kg`]
              },
            ]
          },
          terraformationIndex: `2.129${nbsp}MTi`,
          biomass: `344.344${nbsp}kg`
        }
      ],
    });
  });
});
