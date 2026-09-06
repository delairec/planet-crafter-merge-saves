import type {ParsedSections} from "shared-save-processing/gameDefinitions";
import type {EnergyLevelsViewModel} from "../presentation/viewModels/EnergyLevelsViewModel.ts";
import {SaveSectionsReaderService} from "../infrastructure/SaveSectionsReaderService.ts";
import {EnergyLevelsPresenter} from "../presentation/EnergyLevelsPresenter.ts";
import {LoadEnergyLevelsSection} from "../application/LoadEnergyLevelsSection.ts";

export class LoadEnergyLevelsSectionController {

  static async loadEnergyLevelsSection(sections: ParsedSections): Promise<EnergyLevelsViewModel> {
    const saveParser = new SaveSectionsReaderService(sections);
    const presenter = new EnergyLevelsPresenter();
    const useCase = new LoadEnergyLevelsSection(saveParser, presenter);

    await useCase.execute();

    return presenter.viewModel;
  }
}
