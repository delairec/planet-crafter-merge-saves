import type {GlobalProgressionViewModel} from '../presentation/viewModels/GlobalProgressionViewModel.ts';
import {GlobalProgressionPresenter} from '../presentation/GlobalProgressionPresenter.ts';
import {LoadGlobalProgressionSection} from '../application/LoadGlobalProgressionSection.ts';
import {SaveSectionsReaderService} from '../infrastructure/SaveSectionsReaderService.ts';
import type {ParsedSections} from "shared-save-processing/gameDefinitions";

export class LoadGlobalProgressionSectionController {

  static async loadGlobalProgressionSection(sections: ParsedSections): Promise<GlobalProgressionViewModel> {
    const saveParser = new SaveSectionsReaderService(sections);
    const presenter = new GlobalProgressionPresenter();
    const useCase = new LoadGlobalProgressionSection(saveParser, presenter);

    await useCase.execute();

    return presenter.viewModel;
  }
}


