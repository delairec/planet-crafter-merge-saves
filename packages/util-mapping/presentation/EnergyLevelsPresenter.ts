import {EnergyLevelsValueObject} from "../domain/valueObjects/EnergyLevelsValueObject";
import {EnergyBreakdownEntryValueObject} from "../domain/valueObjects/EnergyBreakdownEntryValueObject";
import {OptimizerValueObject} from "../domain/valueObjects/OptimizerValueObject";
import {EnergyLevelsViewModel} from "./viewModels/EnergyLevelsViewModel";
import {EnergyBreakdownRowViewModel} from "./viewModels/EnergyBreakdownRowViewModel";
import {OptimizerViewModel} from "./viewModels/OptimizerViewModel";
import {formatNumber} from "./formatters/formatNumber/formatNumber";
import {FormatNumberStrategies} from "./formatters/formatNumber/FormatNumberStrategies";
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
      productionBreakdown: [],
      consumptionBreakdown: [],
      optimizers: []
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
        productionBreakdown: this.buildBreakdownRows(energyLevels.productionBreakdown, energyLevels.production),
        consumptionBreakdown: this.buildBreakdownRows(energyLevels.consumptionBreakdown),
        optimizers: this.buildOptimizers(energyLevels.optimizers, energyLevels.production)
      };
  }

  private buildBreakdownRows(breakdown: EnergyBreakdownEntryValueObject[], totalProduction?: number): EnergyBreakdownRowViewModel[] {
    return breakdown.map((entry): EnergyBreakdownRowViewModel => ({
      label: entry.label,
      quantity: formatNumber(entry.quantity),
      unitLevel: formatNumber(entry.unitLevel) + `${nbsp}kW`,
      totalLevel: formatNumber(entry.totalLevel) + `${nbsp}kW` + this.buildContributionSuffix(entry.totalLevel, totalProduction)
    }));
  }

  private buildOptimizers(optimizers: OptimizerValueObject[], totalProduction: number): OptimizerViewModel[] {
    return optimizers.map((optimizer): OptimizerViewModel => ({
      label: optimizer.label,
      fuseCount: formatNumber(optimizer.fuseCount),
      boostedMachines: optimizer.boostedMachines
        .map((machine) => `${formatNumber(machine.quantity)} ${machine.label}`)
        .join(', '),
      contribution: formatNumber(optimizer.contribution) + `${nbsp}kW` + this.buildContributionSuffix(optimizer.contribution, totalProduction)
    }));
  }

  private buildContributionSuffix(value: number, totalProduction?: number): string {
    if (!totalProduction) {
      return '';
    }

    return ` (${formatNumber(value / totalProduction, FormatNumberStrategies.PERCENTAGE)})`;
  }
}
