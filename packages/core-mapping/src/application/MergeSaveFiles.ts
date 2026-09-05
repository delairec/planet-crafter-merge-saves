import {SaveValidatorPort} from "./ports/SaveValidatorPort";
import {SaveFilesMergerPort} from "./ports/SaveFilesMergerPort";
import {MergeResultPresenterPort} from "./ports/MergeResultPresenterPort";
import {MergeSaveFilesRequest} from "./requests/MergeSaveFilesRequest";

export class MergeSaveFiles {
  constructor(
    private readonly validator: SaveValidatorPort,
    private readonly merger: SaveFilesMergerPort,
    private readonly presenter: MergeResultPresenterPort
  ) {}

  async execute({fileNameA, contentA, fileNameB, contentB, saveDisplayName}: MergeSaveFilesRequest): Promise<void> {
    const validationA = this.validator.validate(fileNameA, contentA);
    const validationB = this.validator.validate(fileNameB, contentB);

    if (!validationA.isValid || !validationB.isValid) {
      this.presenter.presentSaveFilesInvalid(validationA.errors, validationB.errors);
      return;
    }

    const {fileName, content} = this.merger.merge(fileNameA, contentA, fileNameB, contentB, saveDisplayName);
    this.presenter.presentMergeSucceeded(fileName, content);
  }
}
