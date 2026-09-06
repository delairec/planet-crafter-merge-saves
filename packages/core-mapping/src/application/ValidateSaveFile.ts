import type {SaveValidatorPort} from "./ports/SaveValidatorPort.ts";
import type {SaveFileValidationPresenterPort} from "./ports/SaveFileValidationPresenterPort.ts";
import type {ValidateSaveFileRequest} from "./requests/ValidateSaveFileRequest.ts";

export class ValidateSaveFile {
  private readonly validator: SaveValidatorPort;
  private readonly presenter: SaveFileValidationPresenterPort;

  constructor(validator: SaveValidatorPort, presenter: SaveFileValidationPresenterPort) {
    this.validator = validator;
    this.presenter = presenter;
  }

  async execute({fileName, content}: ValidateSaveFileRequest): Promise<void> {
    const validation = this.validator.validate(fileName, content);

    if (!validation.isValid) {
      this.presenter.presentInvalidSaveFile(validation.errors, validation.warnings);
      return;
    }

    this.presenter.presentValidSaveFile(validation.warnings);
  }
}
