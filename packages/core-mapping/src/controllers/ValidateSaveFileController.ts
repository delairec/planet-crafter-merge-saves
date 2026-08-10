import {SaveFileValidationViewModel} from "../presentation/viewModels/SaveFileValidationViewModel";
import {createSaveValidator} from "../composition/compositionRoot";
import {SaveFileValidationPresenter} from "../presentation/SaveFileValidationPresenter";
import {ValidateSaveFile} from "../application/ValidateSaveFile";

export class ValidateSaveFileController {
  static validateSaveFile(fileName: string, content: string): SaveFileValidationViewModel {
    const validator = createSaveValidator();
    const presenter = new SaveFileValidationPresenter();
    const useCase = new ValidateSaveFile(validator, presenter);

    useCase.execute(fileName, content);

    return presenter.viewModel;
  }
}
