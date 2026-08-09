import {SaveValidatorPort} from "./ports/SaveValidatorPort";
import {SaveMergerPort} from "./ports/SaveMergerPort";
import {MergeResultPresenterPort} from "./ports/MergeResultPresenterPort";
import {SaveValidationResultValueObject} from "../domain/valueObjects/SaveValidationResultValueObject";
import {hasJsonExtension} from "../../../util-parsing/hasJsonExtension.js";
import {invalidExtensionErrorMessage} from "../../../util-messages/validationMessages.js";

export class MergeSaveFiles {
  constructor(
    private readonly validator: SaveValidatorPort,
    private readonly merger: SaveMergerPort,
    private readonly presenter: MergeResultPresenterPort
  ) {}

  execute(fileNameA: string, contentA: string, fileNameB: string, contentB: string): void {
    const validationA = this.validate(fileNameA, contentA);
    const validationB = this.validate(fileNameB, contentB);

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

  private validate(fileName: string, content: string): SaveValidationResultValueObject {
    if (!hasJsonExtension(fileName)) {
      return {isValid: false, errorMessages: [invalidExtensionErrorMessage]};
    }

    return this.validator.validate(content);
  }
}
