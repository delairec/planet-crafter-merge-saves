import {PlayersViewModel} from '../presentation/viewModels/PlayersViewModel';
import {PlayersPresenter} from '../presentation/PlayersPresenter';
import {LoadSaveData} from '../application/LoadSaveData';
import {SaveParserService} from '../infrastructure/SaveParserService';
import {parseSaveSections} from '../../util-parsing/parseSaveSections.js';

export class LoadSaveDataController {

  constructor(){
  }

  static loadSaveData(saveString: string): PlayersViewModel {
    const sections = parseSaveSections(saveString);
    const saveParser = new SaveParserService(sections);
    const presenter = new PlayersPresenter();
    const useCase = new LoadSaveData(saveParser, presenter);

    useCase.execute();

    return presenter.viewModel;
  }
}


