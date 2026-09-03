import {ParsedSections} from "shared-save-processing/gameDefinitions";
import {EnergyLevelsViewModel} from "../presentation/viewModels/EnergyLevelsViewModel";
import {createSaveParser} from "../composition/compositionRoot";
import {EnergyLevelsPresenter} from "../presentation/EnergyLevelsPresenter";
import {LoadEnergyLevelsSection} from "../application/LoadEnergyLevelsSection";

export class LoadEnergyLevelsSectionController {

  static loadEnergyLevelsSection(sections: ParsedSections): EnergyLevelsViewModel {
    const saveParser = createSaveParser(sections);
    const presenter = new EnergyLevelsPresenter();
    const useCase = new LoadEnergyLevelsSection(saveParser, presenter);

    useCase.execute();

    return presenter.viewModel;
  }
}
