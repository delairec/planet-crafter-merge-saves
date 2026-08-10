import {PlayersViewModel} from '../presentation/viewModels/PlayersViewModel';
import {PlayersPresenter} from '../presentation/PlayersPresenter';
import {LoadPlayersSection} from '../application/LoadPlayersSection';
import {createSaveParser} from '../composition/compositionRoot';
import {ParsedSections} from "../../../util-types/gameDefinitions";

export class LoadPlayersSectionController {

  static loadPlayersSection(sections: ParsedSections): PlayersViewModel {
    const saveParser = createSaveParser(sections);
    const presenter = new PlayersPresenter();
    const useCase = new LoadPlayersSection(saveParser, presenter);

    useCase.execute();

    return presenter.viewModel;
  }
}


