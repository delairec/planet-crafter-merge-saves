import {SaveValidatorPort} from "./ports/SaveValidatorPort";
import {SaveMergerPort} from "./ports/SaveMergerPort";
import {MergeResultPresenterPort} from "./ports/MergeResultPresenterPort";

export class MergeSaveFiles {
  constructor(
    private readonly validator: SaveValidatorPort,
    private readonly merger: SaveMergerPort,
    private readonly presenter: MergeResultPresenterPort
  ) {}

  execute(fileNameA: string, contentA: string, fileNameB: string, contentB: string, saveDisplayName?: string): void {
    const validationA = this.validator.validate(fileNameA, contentA);
    const validationB = this.validator.validate(fileNameB, contentB);

    if (!validationA.isValid || !validationB.isValid) {
      this.presenter.presentSaveFilesInvalid(validationA.errorMessages, validationB.errorMessages);
      return;
    }

    const {fileName, content} = this.merger.merge(fileNameA, contentA, fileNameB, contentB, saveDisplayName);
    this.presenter.presentMergeSucceeded(fileName, content);
  }
}
