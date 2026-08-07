import {SaveValidatorPort} from "./ports/SaveValidatorPort";
import {SaveMergerPort} from "./ports/SaveMergerPort";
import {MergeResultPresenterPort} from "./ports/MergeResultPresenterPort";

export class MergeSaveFiles {
  constructor(
    private readonly validator: SaveValidatorPort,
    private readonly merger: SaveMergerPort,
    private readonly presenter: MergeResultPresenterPort
  ) {}

  execute(fileNameA: string, contentA: string, fileNameB: string, contentB: string): void {
    const validationA = this.validator.validate(contentA);
    const validationB = this.validator.validate(contentB);

    if (!validationA.isValid || !validationB.isValid) {
      this.presenter.present({
        status: 'validationError',
        saveAErrorMessages: validationA.errorMessages,
        saveBErrorMessages: validationB.errorMessages
      });
      return;
    }

    const {fileName, content} = this.merger.merge(fileNameA, contentA, fileNameB, contentB);
    this.presenter.present({status: 'success', fileName, content});
  }
}
