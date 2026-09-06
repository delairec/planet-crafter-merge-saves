import type {SaveFileValidationViewModel} from "../presentation/viewModels/SaveFileValidationViewModel.ts";
import {createSaveValidator} from "../composition/compositionRoot.ts";
import {SaveFileValidationPresenter} from "../presentation/SaveFileValidationPresenter.ts";
import {ValidateSaveFile} from "../application/ValidateSaveFile.ts";
import type {ValidateSaveFileRequest} from "../application/requests/ValidateSaveFileRequest.ts";

export class ValidateSaveFileController {
  static async validateSaveFile(fileName: string, content: string): Promise<SaveFileValidationViewModel> {
    const request: ValidateSaveFileRequest = {fileName, content};
    const validator = createSaveValidator();
    const presenter = new SaveFileValidationPresenter();
    const useCase = new ValidateSaveFile(validator, presenter);

    await useCase.execute(request);

    return presenter.viewModel;
  }
}
