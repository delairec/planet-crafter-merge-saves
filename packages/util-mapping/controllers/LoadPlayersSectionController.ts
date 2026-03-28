import {PlayersViewModel} from '../presentation/viewModels/PlayersViewModel';
import {PlayersPresenter} from '../presentation/PlayersPresenter';
import {LoadPlayersSection} from '../application/LoadPlayersSection';
import {SaveSectionsReaderService} from '../infrastructure/SaveSectionsReaderService';
import { ParsedSections } from "../../util-types/gameDefinitions";

export class LoadPlayersSectionController {

  constructor(){
  }

  static loadPlayersSection(sections: ParsedSections): PlayersViewModel {
    const saveParser = new SaveSectionsReaderService(sections);
    const presenter = new PlayersPresenter();
    const useCase = new LoadPlayersSection(saveParser, presenter);

    useCase.execute();

    return presenter.viewModel;
  }
}


