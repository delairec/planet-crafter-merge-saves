import {describe, expect, it} from 'bun:test';
import {EnergyLevelsViewModel} from "../presentation/viewModels/EnergyLevelsViewModel";
import {parseSaveSections} from "../../util-parsing/parseSaveSections";
import {createFakeSaveContent} from "../../util-testing/fixtures/createFakeSaveContent";
import {ParsedSections} from "../../util-types/gameDefinitions";
import {LoadEnergyLevelsSection} from "../application/LoadEnergyLevelsSection";
import {SaveSectionsReaderService} from "../infrastructure/SaveSectionsReaderService";
import {EnergyLevelsPresenter} from "../presentation/EnergyLevelsPresenter";

const nbsp = '\u00A0';

class LoadEnergyLevelsSectionController {

  static loadEnergyLevelsSection(sections: ParsedSections): EnergyLevelsViewModel {
    const saveParser = new SaveSectionsReaderService(sections);
    const presenter = new EnergyLevelsPresenter();
    const useCase = new LoadEnergyLevelsSection(saveParser, presenter);

    useCase.execute();

    return presenter.viewModel;
  }
}

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
            values: ['Not yet implemented']
          },
          {
            header: 'Available',
            values: ['Not yet implemented']
          }
        ]
      },
    });
  });
});
