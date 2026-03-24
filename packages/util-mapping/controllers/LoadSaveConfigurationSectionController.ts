import {ParsedSections} from "../../util-types/gameDefinitions";
import {SaveConfigurationViewModel} from "../presentation/viewModels/SaveConfigurationViewModel";
import {SaveParserService} from "../infrastructure/SaveParserService";
import {SaveConfigurationPresenter} from "../presentation/SaveConfigurationPresenter";
import {LoadSaveConfigurationSection} from "../application/LoadSaveConfigurationSection";

export class LoadSaveConfigurationSectionController {
  constructor() {
  }

  static loadSaveConfigurationSection(sections: ParsedSections): SaveConfigurationViewModel {
    const saveParser = new SaveParserService(sections);
    const presenter = new SaveConfigurationPresenter();
    const useCase = new LoadSaveConfigurationSection(saveParser, presenter);

    useCase.execute();

    return presenter.viewModel;
  }
}
