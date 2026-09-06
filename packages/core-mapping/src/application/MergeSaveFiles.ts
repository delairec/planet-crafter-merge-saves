import type {SaveValidatorPort} from "./ports/SaveValidatorPort.ts";
import type {SaveFilesMergerPort} from "./ports/SaveFilesMergerPort.ts";
import type {MergeResultPresenterPort} from "./ports/MergeResultPresenterPort.ts";
import type {MergeSaveFilesRequest} from "./requests/MergeSaveFilesRequest.ts";

export class MergeSaveFiles {
  private readonly validator: SaveValidatorPort;
  private readonly merger: SaveFilesMergerPort;
  private readonly presenter: MergeResultPresenterPort;

  constructor(validator: SaveValidatorPort, merger: SaveFilesMergerPort, presenter: MergeResultPresenterPort) {
    this.validator = validator;
    this.merger = merger;
    this.presenter = presenter;
  }

  async execute({fileNameA, contentA, fileNameB, contentB, saveDisplayName}: MergeSaveFilesRequest): Promise<void> {
    const validationA = this.validator.validate(fileNameA, contentA);
    const validationB = this.validator.validate(fileNameB, contentB);

    if (!validationA.isValid || !validationB.isValid) {
      this.presenter.presentSaveFilesInvalid(validationA.errors, validationB.errors, validationA.warnings, validationB.warnings);
      return;
    }

    const {fileName, content} = this.merger.merge(fileNameA, contentA, fileNameB, contentB, saveDisplayName);
    this.presenter.presentMergeSucceeded(fileName, content, validationA.warnings, validationB.warnings);
  }
}
