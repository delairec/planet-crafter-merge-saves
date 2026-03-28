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
      }
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
                values: ['Not yet implemented']
              },
              {
                header: 'Available',
                values: ['Not yet implemented']
              }
            ]
          }
        };
    }
}
