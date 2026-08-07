import {describe, expect, it} from 'bun:test';
import {EnergyLevelsViewModel} from "../presentation/viewModels/EnergyLevelsViewModel";
import {parseSaveSections} from "../../util-parsing/parseSaveSections";
import {createFakeSaveContent} from "../../util-testing/fixtures/createFakeSaveContent";
import {LoadEnergyLevelsSectionController} from "./LoadEnergyLevelsSectionController";

const nbsp = '\u00A0';

describe('LoadEnergyLevelsSectionController', () => {
  it('should present computed energy levels from parsed save', () => {
    // Arrange
    const {sections} = parseSaveSections(createFakeSaveContent());

    // Act
    const viewModel = LoadEnergyLevelsSectionController.loadEnergyLevelsSection(sections);

    // Assert
    expect(viewModel).toEqual<EnergyLevelsViewModel>({
      energyLevels: {
        columns: [
          {
            header: 'Production',
            values: [`2,220.2${nbsp}kW`]
          },
          {
            header: 'Consumption',
            values: [`1.5${nbsp}kW`]
          },
          {
            header: 'Available',
            values: [`2,218.7${nbsp}kW`]
          }
        ]
      },
      balanceInsight: `Surplus of 2,218.7${nbsp}kW`,
      productionBreakdown: [
        {label: 'Nuclear Fusion generator', quantity: '1', unitLevel: `1,485${nbsp}kW`, totalLevel: `1,485${nbsp}kW`},
        {label: 'Nuclear Reactor T2', quantity: '1', unitLevel: `331.5${nbsp}kW`, totalLevel: `331.5${nbsp}kW`},
        {label: 'Wind turbine T2', quantity: '1', unitLevel: `290${nbsp}kW`, totalLevel: `290${nbsp}kW`},
        {label: 'Nuclear Reactor T1', quantity: '1', unitLevel: `86.5${nbsp}kW`, totalLevel: `86.5${nbsp}kW`},
        {label: 'Solar panel T2', quantity: '1', unitLevel: `19.5${nbsp}kW`, totalLevel: `19.5${nbsp}kW`},
        {label: 'Solar panel T1', quantity: '1', unitLevel: `6.5${nbsp}kW`, totalLevel: `6.5${nbsp}kW`},
        {label: 'Wind turbine', quantity: '1', unitLevel: `1.2${nbsp}kW`, totalLevel: `1.2${nbsp}kW`}
      ],
      consumptionBreakdown: [
        {label: 'Heater T1', quantity: '1', unitLevel: `1${nbsp}kW`, totalLevel: `1${nbsp}kW`},
        {label: 'Drill T1', quantity: '1', unitLevel: `0.5${nbsp}kW`, totalLevel: `0.5${nbsp}kW`}
      ]
    });
  });
});
