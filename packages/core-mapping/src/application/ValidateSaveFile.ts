import {SaveValidatorPort} from "./ports/SaveValidatorPort";
import {SaveFileValidationPresenterPort} from "./ports/SaveFileValidationPresenterPort";

export class ValidateSaveFile {
  constructor(
    private readonly validator: SaveValidatorPort,
    private readonly presenter: SaveFileValidationPresenterPort
  ) {
  }

  execute(fileName: string, content: string): void {
    const validation = this.validator.validate(fileName, content);

    if (!validation.isValid) {
      this.presenter.presentInvalidSaveFile(validation.errorMessages);
      return;
    }

    this.presenter.presentValidSaveFile();
  }
}
