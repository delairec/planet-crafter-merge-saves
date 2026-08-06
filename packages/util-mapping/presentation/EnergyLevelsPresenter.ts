import {EnergyLevelsValueObject} from "../domain/valueObjects/EnergyLevelsValueObject";
import {EnergyLevelsViewModel} from "./viewModels/EnergyLevelsViewModel";
import {formatNumber} from "./formatters/formatNumber/formatNumber";
import {EnergyLevelsPresenterPort} from "../application/ports/EnergyLevelsPresenterPort";

const nbsp = '\u00A0';

export class EnergyLevelsPresenter implements EnergyLevelsPresenterPort {
  viewModel: EnergyLevelsViewModel;

  constructor() {
    this.viewModel = {
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
      balanceInsight: ''
    };
  }

  present(energyLevels: EnergyLevelsValueObject): void {
        this.viewModel = {
          energyLevels: {
            columns: [
              {
                header: 'Production',
                values: [formatNumber(energyLevels.production) + `${nbsp}kW`]
              },
              {
                header: 'Consumption',
                values: [formatNumber(energyLevels.consumption) + `${nbsp}kW`]
              },
              {
                header: 'Available',
                values: [formatNumber(energyLevels.available) + `${nbsp}kW`]
              }
            ]
          },
          balanceInsight: this.buildBalanceInsight(energyLevels.available)
        };
    }

  private buildBalanceInsight(available: number): string {
    if (available >= 0) {
      return `Surplus of ${formatNumber(available)}${nbsp}kW`;
    }

    return `⚠️ Power deficit of ${formatNumber(Math.abs(available))}${nbsp}kW — your base is at risk`;
  }
}
