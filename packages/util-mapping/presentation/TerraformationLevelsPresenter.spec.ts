import {describe, expect, it} from 'bun:test';
import {TerraformationLevelsPresenter} from './TerraformationLevelsPresenter';
import {TerraformationLevelsViewModel} from './viewModels/TerraformationLevelsViewModel';

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
          }
        }
      ],
    });
  });

  it('should present all terraformation levels', () => {
    // Arrange
    const presenter = new TerraformationLevelsPresenter();

    // Act
    presenter.present([
      {
        planetId: "Earth",
        unitOxygenLevel: 123123,
        unitHeatLevel: 456456,
        unitPressureLevel: 789789,
        unitPlantsLevel: 101101,
        unitInsectsLevel: 112112,
        unitAnimalsLevel: 131131,
        unitPurificationLevel: 415415,
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
                values: ['123,123']
              },
              {
                header: 'Heat',
                values: ['456,456']
              },
              {
                header: 'Pressure',
                values: ['789,789']
              },
              {
                header: 'Purification',
                values: ['415,415']
              }
            ]
          },
          organicLevels: {
            columns: [
              {
                header: 'Plants',
                values: ['101,101']
              },
              {
                header: 'Insects',
                values: ['112,112']
              },
              {
                header: 'Animals',
                values: ['131,131']
              },
            ]
          }
        }
      ],
    });
  });
});
