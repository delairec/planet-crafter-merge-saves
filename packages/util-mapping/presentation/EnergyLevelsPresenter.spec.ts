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
      },
      balanceInsight: '',
      productionBreakdown: [],
      consumptionBreakdown: []
    });
  });

  describe('When production covers consumption', () => {
    it('should present a surplus insight', () => {
      // Arrange
      const presenter = new EnergyLevelsPresenter();

      // Act
      presenter.present({
        production: 80_000,
        consumption: 0,
        available: 80_000,
        productionBreakdown: [],
        consumptionBreakdown: []
      });

      // Assert
      expect(presenter.viewModel.balanceInsight).toBe(`Surplus of 80,000${nbsp}kW`);
    });
  });

  describe('When consumption exceeds production', () => {
    it('should present a deficit warning insight', () => {
      // Arrange
      const presenter = new EnergyLevelsPresenter();

      // Act
      presenter.present({
        production: 5_000,
        consumption: 8_000,
        available: -3_000,
        productionBreakdown: [],
        consumptionBreakdown: []
      });

      // Assert
      expect(presenter.viewModel.balanceInsight).toBe(`⚠️ Power deficit of 3,000${nbsp}kW — your base is at risk`);
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
      productionBreakdown: [],
      consumptionBreakdown: []
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
              values: ['0' + `${nbsp}kW`]
            },
            {
              header: 'Available',
              values: ['80,000' + `${nbsp}kW`]
            }
          ]
        },
        balanceInsight: `Surplus of 80,000${nbsp}kW`,
        productionBreakdown: [],
        consumptionBreakdown: []
      }
    );
  });

  it('should present the production and consumption breakdowns as rows', () => {
    // Arrange
    const presenter = new EnergyLevelsPresenter();

    // Act
    presenter.present({
      production: 590,
      consumption: 182,
      available: 408,
      productionBreakdown: [{
        label: 'Wind turbine T2',
        quantity: 2,
        unitLevel: 290,
        totalLevel: 580
      }],
      consumptionBreakdown: [{
        label: 'Drill T3',
        quantity: 4,
        unitLevel: 45.5,
        totalLevel: 182
      }]
    });

    // Assert
    expect(presenter.viewModel.productionBreakdown).toEqual([{
      label: 'Wind turbine T2',
      quantity: '2',
      unitLevel: `290${nbsp}kW`,
      totalLevel: `580${nbsp}kW`
    }]);
    expect(presenter.viewModel.consumptionBreakdown).toEqual([{
      label: 'Drill T3',
      quantity: '4',
      unitLevel: `45.5${nbsp}kW`,
      totalLevel: `182${nbsp}kW`
    }]);
  });
});
