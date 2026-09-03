import {PlayersViewModel} from '../presentation/viewModels/PlayersViewModel';
import {PlayersPresenter} from '../presentation/PlayersPresenter';
import {LoadPlayersSection} from '../application/LoadPlayersSection';
import {SaveSectionsReaderService} from '../infrastructure/SaveSectionsReaderService';
import {ParsedSections} from "shared-save-processing/gameDefinitions";

export class LoadPlayersSectionController {

  static async loadPlayersSection(sections: ParsedSections): Promise<PlayersViewModel> {
    const saveParser = new SaveSectionsReaderService(sections);
    const presenter = new PlayersPresenter();
    const useCase = new LoadPlayersSection(saveParser, presenter);

    await useCase.execute();

    return presenter.viewModel;
  }
}


