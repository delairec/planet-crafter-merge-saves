import {ParsedSections} from "shared-save-processing/gameDefinitions";
import {EnergyLevelsViewModel} from "../presentation/viewModels/EnergyLevelsViewModel";
import {SaveSectionsReaderService} from "../infrastructure/SaveSectionsReaderService";
import {EnergyLevelsPresenter} from "../presentation/EnergyLevelsPresenter";
import {LoadEnergyLevelsSection} from "../application/LoadEnergyLevelsSection";

export class LoadEnergyLevelsSectionController {

  static async loadEnergyLevelsSection(sections: ParsedSections): Promise<EnergyLevelsViewModel> {
    const saveParser = new SaveSectionsReaderService(sections);
    const presenter = new EnergyLevelsPresenter();
    const useCase = new LoadEnergyLevelsSection(saveParser, presenter);

    await useCase.execute();

    return presenter.viewModel;
  }
}
