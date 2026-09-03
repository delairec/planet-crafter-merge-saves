import {SaveFileValidationViewModel} from "../presentation/viewModels/SaveFileValidationViewModel";
import {createSaveValidator} from "../composition/compositionRoot";
import {SaveFileValidationPresenter} from "../presentation/SaveFileValidationPresenter";
import {ValidateSaveFile} from "../application/ValidateSaveFile";
import {ValidateSaveFileRequest} from "../application/ValidateSaveFileRequest";

export class ValidateSaveFileController {
  static validateSaveFile(fileName: string, content: string): SaveFileValidationViewModel {
    const request: ValidateSaveFileRequest = {fileName, content};
    const validator = createSaveValidator();
    const presenter = new SaveFileValidationPresenter();
    const useCase = new ValidateSaveFile(validator, presenter);

    useCase.execute(request);

    return presenter.viewModel;
  }
}
