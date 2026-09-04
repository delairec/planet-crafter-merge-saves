import {SaveValidatorPort} from "./ports/SaveValidatorPort";
import {SaveFileValidationPresenterPort} from "./ports/SaveFileValidationPresenterPort";
import {ValidateSaveFileRequest} from "./requests/ValidateSaveFileRequest";

export class ValidateSaveFile {
  constructor(
    private readonly validator: SaveValidatorPort,
    private readonly presenter: SaveFileValidationPresenterPort
  ) {
  }

  async execute({fileName, content}: ValidateSaveFileRequest): Promise<void> {
    const validation = this.validator.validate(fileName, content);

    if (!validation.isValid) {
      this.presenter.presentInvalidSaveFile(validation.errors);
      return;
    }

    this.presenter.presentValidSaveFile();
  }
}
