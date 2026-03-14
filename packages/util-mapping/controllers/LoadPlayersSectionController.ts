import {PlayersViewModel} from '../presentation/viewModels/PlayersViewModel';
import {PlayersPresenter} from '../presentation/PlayersPresenter';
import {LoadPlayersSection} from '../application/LoadPlayersSection';
import {SaveParserService} from '../infrastructure/SaveParserService';
import { ParsedSave } from "../../util-types/gameDefinitions";

export class LoadPlayersSectionController {

  constructor(){
  }

  static loadPlayersSection(sections: ParsedSave): PlayersViewModel {
    const saveParser = new SaveParserService(sections);
    const presenter = new PlayersPresenter();
    const useCase = new LoadPlayersSection(saveParser, presenter);

    useCase.execute();

    return presenter.viewModel;
  }
}


