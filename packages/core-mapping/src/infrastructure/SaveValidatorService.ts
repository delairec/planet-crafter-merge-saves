import {hasJsonExtension} from "shared-save-processing/hasJsonExtension.js";
import {invalidExtensionErrorMessage} from "util-messages/validationMessages.js";
import {validateSaveContent} from "./validateSaveContent.js";
import {SaveValidatorPort} from "../application/ports/SaveValidatorPort";
import {SaveValidationResult} from "../application/ports/SaveValidationResult";

export class SaveValidatorService implements SaveValidatorPort {
  validate(fileName: string, content: string): SaveValidationResult {
    if (!hasJsonExtension(fileName)) {
      return {isValid: false, errors: [{code: 'invalid-extension', detail: invalidExtensionErrorMessage}]};
    }

    const {isValid, errors} = validateSaveContent(content);

    return {isValid, errors};
  }
}
