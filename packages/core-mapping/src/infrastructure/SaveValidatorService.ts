import {validateMergedSave} from "cli-validate/validate.js";
import {hasJsonExtension} from "util-parsing/hasJsonExtension.js";
import {invalidExtensionErrorMessage} from "util-messages/validationMessages.js";
import {SaveValidatorPort} from "../application/ports/SaveValidatorPort";
import {SaveValidationResult} from "../application/ports/SaveValidationResult";

export class SaveValidatorService implements SaveValidatorPort {
  validate(fileName: string, content: string): SaveValidationResult {
    if (!hasJsonExtension(fileName)) {
      return {isValid: false, errorMessages: [invalidExtensionErrorMessage]};
    }

    const {isValid, errors} = validateMergedSave(content);

    return {
      isValid,
      errorMessages: errors.map((error) => error.message)
    };
  }
}
