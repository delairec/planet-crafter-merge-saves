import {EnergyLevelsValueObject} from "../domain/valueObjects/EnergyLevelsValueObject";
import {EnergyBreakdownEntryValueObject} from "../domain/valueObjects/EnergyBreakdownEntryValueObject";
import {OptimizerValueObject} from "../domain/valueObjects/OptimizerValueObject";
import {EnergyLevelsViewModel} from "./viewModels/EnergyLevelsViewModel";
import {EnergyBreakdownRowViewModel} from "./viewModels/EnergyBreakdownRowViewModel";
import {OptimizerViewModel} from "./viewModels/OptimizerViewModel";
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
      balanceInsight: '',
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
        balanceInsight: this.buildBalanceInsight(energyLevels.available),
        productionBreakdown: this.buildBreakdownRows(energyLevels.productionBreakdown),
        consumptionBreakdown: this.buildBreakdownRows(energyLevels.consumptionBreakdown),
        optimizers: this.buildOptimizers(energyLevels.optimizers)
      };
  }

  private buildBalanceInsight(available: number): string {
  if (available >= 0) {
    return `Surplus of ${formatNumber(available)}${nbsp}kW`;
  }

  return `⚠️ Power deficit of ${formatNumber(Math.abs(available))}${nbsp}kW — your base is at risk`;
  }

  private buildBreakdownRows(breakdown: EnergyBreakdownEntryValueObject[]): EnergyBreakdownRowViewModel[] {
    return breakdown.map((entry): EnergyBreakdownRowViewModel => ({
      label: entry.label,
      quantity: formatNumber(entry.quantity),
      unitLevel: formatNumber(entry.unitLevel) + `${nbsp}kW`,
      totalLevel: formatNumber(entry.totalLevel) + `${nbsp}kW`
    }));
  }

  private buildOptimizers(optimizers: OptimizerValueObject[]): OptimizerViewModel[] {
    return optimizers.map((optimizer): OptimizerViewModel => ({
      label: optimizer.label,
      fuseCount: formatNumber(optimizer.fuseCount),
      boostedMachines: optimizer.boostedMachines
        .map((machine) => `${formatNumber(machine.quantity)} ${machine.label}`)
        .join(', '),
      contribution: formatNumber(optimizer.contribution) + `${nbsp}kW`
    }));
  }
}
