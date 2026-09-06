import type {PlayersViewModel} from '../presentation/viewModels/PlayersViewModel.ts';
import {PlayersPresenter} from '../presentation/PlayersPresenter.ts';
import {LoadPlayersSection} from '../application/LoadPlayersSection.ts';
import {SaveSectionsReaderService} from '../infrastructure/SaveSectionsReaderService.ts';
import type {ParsedSections} from "shared-save-processing/gameDefinitions";

export class LoadPlayersSectionController {

  static async loadPlayersSection(sections: ParsedSections): Promise<PlayersViewModel> {
    const saveParser = new SaveSectionsReaderService(sections);
    const presenter = new PlayersPresenter();
    const useCase = new LoadPlayersSection(saveParser, presenter);

    await useCase.execute();

    return presenter.viewModel;
  }
}


