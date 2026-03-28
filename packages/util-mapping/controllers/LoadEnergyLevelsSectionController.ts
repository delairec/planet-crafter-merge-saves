import {ParsedSections} from "../../util-types/gameDefinitions";
import {EnergyLevelsViewModel} from "../presentation/viewModels/EnergyLevelsViewModel";
import {SaveSectionsReaderService} from "../infrastructure/SaveSectionsReaderService";
import {EnergyLevelsPresenter} from "../presentation/EnergyLevelsPresenter";
import {LoadEnergyLevelsSection} from "../application/LoadEnergyLevelsSection";

export class LoadEnergyLevelsSectionController {

  static loadEnergyLevelsSection(sections: ParsedSections): EnergyLevelsViewModel {
    const saveParser = new SaveSectionsReaderService(sections);
    const presenter = new EnergyLevelsPresenter();
    const useCase = new LoadEnergyLevelsSection(saveParser, presenter);

    useCase.execute();

    return presenter.viewModel;
  }
}
