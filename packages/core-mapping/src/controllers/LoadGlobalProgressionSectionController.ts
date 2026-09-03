import {GlobalProgressionViewModel} from '../presentation/viewModels/GlobalProgressionViewModel';
import {GlobalProgressionPresenter} from '../presentation/GlobalProgressionPresenter';
import {LoadGlobalProgressionSection} from '../application/LoadGlobalProgressionSection';
import {createSaveParser} from '../composition/compositionRoot';
import {ParsedSections} from "shared-save-processing/gameDefinitions";

export class LoadGlobalProgressionSectionController {

  static loadGlobalProgressionSection(sections: ParsedSections): GlobalProgressionViewModel {
    const saveParser = createSaveParser(sections);
    const presenter = new GlobalProgressionPresenter();
    const useCase = new LoadGlobalProgressionSection(saveParser, presenter);

    useCase.execute();

    return presenter.viewModel;
  }
}


