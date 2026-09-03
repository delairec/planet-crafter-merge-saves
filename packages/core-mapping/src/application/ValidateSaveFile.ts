import {SaveValidatorPort} from "./ports/SaveValidatorPort";
import {SaveFileValidationPresenterPort} from "./ports/SaveFileValidationPresenterPort";
import {ValidateSaveFileRequest} from "./ValidateSaveFileRequest";

export class ValidateSaveFile {
  constructor(
    private readonly validator: SaveValidatorPort,
    private readonly presenter: SaveFileValidationPresenterPort
  ) {
  }

  execute(request: ValidateSaveFileRequest): void {
    const {fileName, content} = request;
    const validation = this.validator.validate(fileName, content);

    if (!validation.isValid) {
      this.presenter.presentInvalidSaveFile(validation.errors);
      return;
    }

    this.presenter.presentValidSaveFile();
  }
}
