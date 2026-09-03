import {EnergyLevelsValueObject} from "../domain/valueObjects/EnergyLevelsValueObject";
import {PlanetEnergyLevelsValueObject} from "../domain/valueObjects/PlanetEnergyLevelsValueObject";
import {EnergyBreakdownEntryValueObject} from "../domain/valueObjects/EnergyBreakdownEntryValueObject";
import {OptimizerValueObject} from "../domain/valueObjects/OptimizerValueObject";
import {EnergyLevelsViewModel} from "./viewModels/EnergyLevelsViewModel";
import {PlanetEnergyLevelsViewModel} from "./viewModels/PlanetEnergyLevelsViewModel";
import {EnergyBreakdownRowViewModel} from "./viewModels/EnergyBreakdownRowViewModel";
import {OptimizerViewModel} from "./viewModels/OptimizerViewModel";
import {formatNumber} from "./formatters/formatNumber/formatNumber";
import {FormatNumberStrategies} from "./formatters/formatNumber/FormatNumberStrategies";
import {EnergyLevelsPresenterPort} from "../application/ports/EnergyLevelsPresenterPort";
import {
  energyLevelsSectionAvailableTitle,
  energyLevelsSectionConsumptionTitle,
  energyLevelsSectionProductionTitle,
  energyLevelsSectionWorkInProgressLabel
} from "util-messages/energyLevelsSectionMessages.js";

const nbsp = '\u00A0';

export class EnergyLevelsPresenter implements EnergyLevelsPresenterPort {
  viewModel: EnergyLevelsViewModel;

  constructor() {
    this.viewModel = {
      planets: []
    };
  }

  displayEnergyLevels(energyLevels: EnergyLevelsValueObject): void {
    this.viewModel = {
      planets: energyLevels.planets.map((planet): PlanetEnergyLevelsViewModel => this.buildPlanet(planet))
    };
  }

  private buildPlanet(planet: PlanetEnergyLevelsValueObject): PlanetEnergyLevelsViewModel {
    return {
      planetId: planet.planetId,
      energyLevels: {
        columns: [
          {
            header: energyLevelsSectionProductionTitle,
            values: [formatNumber(planet.production) + `${nbsp}kW`]
          },
          {
            header: energyLevelsSectionConsumptionTitle,
            values: [formatNumber(planet.consumption) + `${nbsp}kW ${energyLevelsSectionWorkInProgressLabel}`]
          },
          {
            header: energyLevelsSectionAvailableTitle,
            values: [formatNumber(planet.available) + `${nbsp}kW ${energyLevelsSectionWorkInProgressLabel}`]
          }
        ]
      },
      productionBreakdown: this.buildBreakdownRows(planet.productionBreakdown, planet.production),
      consumptionBreakdown: this.buildBreakdownRows(planet.consumptionBreakdown),
      optimizers: this.buildOptimizers(planet.optimizers, planet.production)
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
