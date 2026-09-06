import type {TerraformationLevelsViewModel} from '../presentation/viewModels/TerraformationLevelsViewModel.ts';
import {TerraformationLevelsPresenter} from '../presentation/TerraformationLevelsPresenter.ts';
import {LoadTerraformationLevelsSection} from '../application/LoadTerraformationLevelsSection.ts';
import {SaveSectionsReaderService} from '../infrastructure/SaveSectionsReaderService.ts';
import type {ParsedSections} from "shared-save-processing/gameDefinitions";

export class LoadTerraformationLevelsSectionController {
  static async loadTerraformationLevelsSection(sections: ParsedSections): Promise<TerraformationLevelsViewModel> {
    const saveParser = new SaveSectionsReaderService(sections);
    const presenter = new TerraformationLevelsPresenter();
    const useCase = new LoadTerraformationLevelsSection(saveParser, presenter);

    await useCase.execute();

    return presenter.viewModel;
  }
}

