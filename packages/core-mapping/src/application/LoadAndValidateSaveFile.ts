import type {SaveValidatorPort} from "./ports/SaveValidatorPort.ts";
import type {SaveSectionsParserPort} from "./ports/SaveSectionsParserPort.ts";
import type {LoadAndValidateSaveFilePresenterPort} from "./ports/LoadAndValidateSaveFilePresenterPort.ts";
import type {LoadAndValidateSaveFileRequest} from "./requests/LoadAndValidateSaveFileRequest.ts";

export class LoadAndValidateSaveFile {
  constructor(
    private readonly validator: SaveValidatorPort,
    private readonly parser: SaveSectionsParserPort,
    private readonly presenter: LoadAndValidateSaveFilePresenterPort
  ) {
  }

  async execute({fileName, content}: LoadAndValidateSaveFileRequest): Promise<void> {
    const validation = this.validator.validate(fileName, content);

    if (!validation.isValid) {
      this.presenter.presentInvalidSaveFile(validation.errors, validation.warnings);
      return;
    }

    const {sections, errors} = this.parser.parse(content);
    this.presenter.presentLoadedSaveFile(sections, errors, validation.warnings);
  }
}
