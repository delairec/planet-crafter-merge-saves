import {TerraformationLevelsViewModel} from '../presentation/viewModels/TerraformationLevelsViewModel';
import {TerraformationLevelsPresenter} from '../presentation/TerraformationLevelsPresenter';
import {LoadTerraformationLevelsSection} from '../application/LoadTerraformationLevelsSection';
import {SaveParserService} from '../infrastructure/SaveParserService';
import { ParsedSections } from "../../util-types/gameDefinitions";

export class LoadTerraformationLevelsSectionController {
  static loadTerraformationLevelsSection(sections: ParsedSections): TerraformationLevelsViewModel {
    const saveParser = new SaveParserService(sections);
    const presenter = new TerraformationLevelsPresenter();
    const useCase = new LoadTerraformationLevelsSection(saveParser, presenter);

    useCase.execute();

    return presenter.viewModel;
  }
}

