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
            values: [`2,220.7${nbsp}kW`]
          },
          {
            header: 'Consumption',
            values: [`1.5${nbsp}kW`]
          },
          {
            header: 'Available',
            values: [`2,219.2${nbsp}kW`]
          }
        ]
      },
      balanceInsight: `Surplus of 2,219.2${nbsp}kW`
    });
  });
});
