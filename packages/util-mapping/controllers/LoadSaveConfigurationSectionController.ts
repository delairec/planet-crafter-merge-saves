import {ParsedSections} from "../../util-types/gameDefinitions";
import {SaveConfigurationViewModel} from "../presentation/viewModels/SaveConfigurationViewModel";
import {SaveSectionsReaderService} from "../infrastructure/SaveSectionsReaderService";
import {SaveConfigurationPresenter} from "../presentation/SaveConfigurationPresenter";
import {LoadSaveConfigurationSection} from "../application/LoadSaveConfigurationSection";

export class LoadSaveConfigurationSectionController {
  constructor() {
  }

  static loadSaveConfigurationSection(sections: ParsedSections): SaveConfigurationViewModel {
    const saveParser = new SaveSectionsReaderService(sections);
    const presenter = new SaveConfigurationPresenter();
    const useCase = new LoadSaveConfigurationSection(saveParser, presenter);

    useCase.execute();

    return presenter.viewModel;
  }
}
