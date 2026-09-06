import {describe, expect, it} from 'bun:test';
import type {EnergyLevelsViewModel} from "../presentation/viewModels/EnergyLevelsViewModel.ts";
import {parseSaveSections} from "shared-save-processing/parseSaveSections.js";
import {createFakeSaveContent} from "shared-save-processing/testing/createFakeSaveContent.js";
import {LoadEnergyLevelsSectionController} from "./LoadEnergyLevelsSectionController.ts";

const nbsp = '\u00A0';

describe('LoadEnergyLevelsSectionController', () => {
  it('should present computed energy levels from the parsed save', async () => {
    // Arrange
    const {sections} = parseSaveSections(createFakeSaveContent());

    // Act
    const viewModel = await LoadEnergyLevelsSectionController.loadEnergyLevelsSection(sections);

    // Assert
    expect(viewModel).toEqual<EnergyLevelsViewModel>({
      planets: [{
        planetId: 'Planet 1',
        energyLevels: {
          columns: [
            {
              header: 'Production',
              values: [`2,220.2${nbsp}kW`]
            },
            {
              header: 'Consumption',
              values: [`1.5${nbsp}kW 🚧 Work In Progress`]
            },
            {
              header: 'Available',
              values: [`2,218.7${nbsp}kW 🚧 Work In Progress`]
            }
          ]
        },
        productionBreakdown: [
          {label: 'Nuclear Fusion generator', quantity: '1', unitLevel: `1,485${nbsp}kW`, totalLevel: `1,485${nbsp}kW (67%)`},
          {label: 'Nuclear Reactor T2', quantity: '1', unitLevel: `331.5${nbsp}kW`, totalLevel: `331.5${nbsp}kW (15%)`},
          {label: 'Wind turbine T2', quantity: '1', unitLevel: `290${nbsp}kW`, totalLevel: `290${nbsp}kW (13%)`},
          {label: 'Nuclear Reactor T1', quantity: '1', unitLevel: `86.5${nbsp}kW`, totalLevel: `86.5${nbsp}kW (4%)`},
          {label: 'Solar panel T2', quantity: '1', unitLevel: `19.5${nbsp}kW`, totalLevel: `19.5${nbsp}kW (1%)`},
          {label: 'Solar panel T1', quantity: '1', unitLevel: `6.5${nbsp}kW`, totalLevel: `6.5${nbsp}kW (0%)`},
          {label: 'Wind turbine', quantity: '1', unitLevel: `1.2${nbsp}kW`, totalLevel: `1.2${nbsp}kW (0%)`}
        ],
        consumptionBreakdown: [
          {label: 'Heater T1', quantity: '1', unitLevel: `1${nbsp}kW`, totalLevel: `1${nbsp}kW`},
          {label: 'Drill T1', quantity: '1', unitLevel: `0.5${nbsp}kW`, totalLevel: `0.5${nbsp}kW`}
        ],
        optimizers: []
      }]
    });
  });
});
