import {ParsedSections} from "shared-save-processing/gameDefinitions";
import {SaveConfigurationViewModel} from "../presentation/viewModels/SaveConfigurationViewModel";
import {createSaveParser} from "../composition/compositionRoot";
import {SaveConfigurationPresenter} from "../presentation/SaveConfigurationPresenter";
import {LoadSaveConfigurationSection} from "../application/LoadSaveConfigurationSection";

export class LoadSaveConfigurationSectionController {
  static loadSaveConfigurationSection(sections: ParsedSections): SaveConfigurationViewModel {
    const saveParser = createSaveParser(sections);
    const presenter = new SaveConfigurationPresenter();
    const useCase = new LoadSaveConfigurationSection(saveParser, presenter);

    useCase.execute();

    return presenter.viewModel;
  }
}
