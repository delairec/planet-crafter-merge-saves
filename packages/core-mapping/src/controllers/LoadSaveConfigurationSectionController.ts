import type {ParsedSections} from "shared-save-processing/gameDefinitions";
import type {SaveConfigurationViewModel} from "../presentation/viewModels/SaveConfigurationViewModel.ts";
import {SaveSectionsReaderService} from "../infrastructure/SaveSectionsReaderService.ts";
import {SaveConfigurationPresenter} from "../presentation/SaveConfigurationPresenter.ts";
import {LoadSaveConfigurationSection} from "../application/LoadSaveConfigurationSection.ts";

export class LoadSaveConfigurationSectionController {
  static async loadSaveConfigurationSection(sections: ParsedSections): Promise<SaveConfigurationViewModel> {
    const saveParser = new SaveSectionsReaderService(sections);
    const presenter = new SaveConfigurationPresenter();
    const useCase = new LoadSaveConfigurationSection(saveParser, presenter);

    await useCase.execute();

    return presenter.viewModel;
  }
}
