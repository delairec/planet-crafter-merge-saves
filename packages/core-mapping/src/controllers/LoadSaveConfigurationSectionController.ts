import {ParsedSections} from "shared-save-processing/gameDefinitions";
import {SaveConfigurationViewModel} from "../presentation/viewModels/SaveConfigurationViewModel";
import {SaveSectionsReaderService} from "../infrastructure/SaveSectionsReaderService";
import {SaveConfigurationPresenter} from "../presentation/SaveConfigurationPresenter";
import {LoadSaveConfigurationSection} from "../application/LoadSaveConfigurationSection";

export class LoadSaveConfigurationSectionController {
  static async loadSaveConfigurationSection(sections: ParsedSections): Promise<SaveConfigurationViewModel> {
    const saveParser = new SaveSectionsReaderService(sections);
    const presenter = new SaveConfigurationPresenter();
    const useCase = new LoadSaveConfigurationSection(saveParser, presenter);

    await useCase.execute();

    return presenter.viewModel;
  }
}
