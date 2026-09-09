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
import {worldObjectLabels} from "./worldObjectLabels";
import {
  energyLevelsSectionAvailableTitle,
  energyLevelsSectionConsumptionTitle,
  energyLevelsSectionProductionTitle,
  energyLevelsSectionWorkInProgressLabel
} from "./messages/energyLevelsSectionMessages.js";

const nbsp = '\u00A0';

export class EnergyLevelsPresenter implements EnergyLevelsPresenterPort {
  private _viewModel: EnergyLevelsViewModel;

  constructor() {
    this._viewModel = {
      planets: []
    };
  }

  get viewModel(): EnergyLevelsViewModel {
    return this._viewModel;
  }

  displayEnergyLevels(energyLevels: EnergyLevelsValueObject): void {
    this._viewModel = {
      planets: energyLevels.planets.map((planet): PlanetEnergyLevelsViewModel => this.buildPlanet(planet))
    };
  }

  private buildPlanet(planet: PlanetEnergyLevelsValueObject): PlanetEnergyLevelsViewModel {
    return {
      planetId: planet.planetName ?? `Planet ${planet.planetId}`,
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
      productionBreakdown: this.buildBreakdownRows(planet.productionBreakdown),
      consumptionBreakdown: this.buildBreakdownRows(planet.consumptionBreakdown),
      optimizers: this.buildOptimizers(planet.optimizers)
    };
  }

  private buildBreakdownRows(breakdown: readonly EnergyBreakdownEntryValueObject[]): EnergyBreakdownRowViewModel[] {
    return breakdown.map((entry): EnergyBreakdownRowViewModel => ({
      label: worldObjectLabels[entry.name],
      quantity: formatNumber(entry.quantity),
      unitLevel: formatNumber(entry.unitLevel) + `${nbsp}kW`,
      totalLevel: formatNumber(entry.totalLevel) + `${nbsp}kW` + this.buildContributionSuffix(entry.productionRatio)
    }));
  }

  private buildOptimizers(optimizers: readonly OptimizerValueObject[]): OptimizerViewModel[] {
    return optimizers.map((optimizer): OptimizerViewModel => ({
      label: worldObjectLabels[optimizer.name],
      fuseCount: formatNumber(optimizer.fuseCount),
      boostedMachines: optimizer.boostedMachines
        .map((machine) => `${formatNumber(machine.quantity)} ${worldObjectLabels[machine.name]}`)
        .join(', '),
      contribution: formatNumber(optimizer.contribution) + `${nbsp}kW` + this.buildContributionSuffix(optimizer.productionRatio)
    }));
  }

  private buildContributionSuffix(productionRatio?: number): string {
    if (!productionRatio) {
      return '';
    }

    return ` (${formatNumber(productionRatio, FormatNumberStrategies.PERCENTAGE)})`;
  }
}
