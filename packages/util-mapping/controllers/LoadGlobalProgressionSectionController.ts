import {GlobalProgressionViewModel} from '../presentation/viewModels/GlobalProgressionViewModel';
import {GlobalProgressionPresenter} from '../presentation/GlobalProgressionPresenter';
import {LoadGlobalProgressionSection} from '../application/LoadGlobalProgressionSection';
import {SaveParserService} from '../infrastructure/SaveParserService';
import {ParsedSave} from "../../util-types/gameDefinitions";

export class LoadGlobalProgressionSectionController {

  constructor(){
  }

  static loadGlobalProgressionSection(sections: ParsedSave): GlobalProgressionViewModel {
    const saveParser = new SaveParserService(sections);
    const presenter = new GlobalProgressionPresenter();
    const useCase = new LoadGlobalProgressionSection(saveParser, presenter);

    useCase.execute();

    return presenter.viewModel;
  }
}


