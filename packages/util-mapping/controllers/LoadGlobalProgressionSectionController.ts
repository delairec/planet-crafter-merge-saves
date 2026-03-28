import {GlobalProgressionViewModel} from '../presentation/viewModels/GlobalProgressionViewModel';
import {GlobalProgressionPresenter} from '../presentation/GlobalProgressionPresenter';
import {LoadGlobalProgressionSection} from '../application/LoadGlobalProgressionSection';
import {SaveSectionsReaderService} from '../infrastructure/SaveSectionsReaderService';
import { ParsedSections } from "../../util-types/gameDefinitions";

export class LoadGlobalProgressionSectionController {

  constructor(){
  }

  static loadGlobalProgressionSection(sections: ParsedSections): GlobalProgressionViewModel {
    const saveParser = new SaveSectionsReaderService(sections);
    const presenter = new GlobalProgressionPresenter();
    const useCase = new LoadGlobalProgressionSection(saveParser, presenter);

    useCase.execute();

    return presenter.viewModel;
  }
}


