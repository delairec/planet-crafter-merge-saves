import {describe, expect, it} from 'bun:test';
import {EnergyLevelsPresenter} from "./EnergyLevelsPresenter";
import {EnergyLevelsViewModel} from "./viewModels/EnergyLevelsViewModel";

const nbsp = '\u00A0';

describe('EnergyLevelsPresenter', () => {
  it('should initialize with default view model', () => {
    // Act
    const presenter = new EnergyLevelsPresenter();

    // Assert
    expect(presenter.viewModel).toEqual<EnergyLevelsViewModel>({
      energyLevels: {
        columns: [
          {
            header: 'Production',
            values: ['']
          },
          {
            header: 'Consumption',
            values: ['Not yet implemented']
          },
          {
            header: 'Available',
            values: ['Not yet implemented']
          }
        ]
      }
    });
  });

  it('should present energy levels', () => {
    // Arrange
    const presenter = new EnergyLevelsPresenter();

    // Act
    presenter.present({
      production: 80_000,
      consumption: 0,
      available: 80_000,
    });

    // Assert
    expect(presenter.viewModel).toEqual<EnergyLevelsViewModel>(
      {
        energyLevels: {
          columns: [
            {
              header: 'Production',
              values: ['80,000' + `${nbsp}kW`]
            },
            {
              header: 'Consumption',
              values: ['Not yet implemented']
            },
            {
              header: 'Available',
              values: ['Not yet implemented']
            }
          ]
        }
      }
    );
  });
});
