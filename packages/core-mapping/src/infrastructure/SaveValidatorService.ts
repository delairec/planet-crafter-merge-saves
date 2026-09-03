import {hasJsonExtension} from "shared-save-processing/hasJsonExtension.js";
import {validateSaveContent} from "./validateSaveContent.js";
import {SaveValidatorPort} from "../application/ports/SaveValidatorPort";
import {SaveValidationResult} from "../application/ports/SaveValidationResult";
import {VALIDATION_ISSUE_CODES} from "../application/ports/ValidationIssue";

export class SaveValidatorService implements SaveValidatorPort {
  validate(fileName: string, content: string): SaveValidationResult {
    if (!hasJsonExtension(fileName)) {
      return {isValid: false, errors: [{code: VALIDATION_ISSUE_CODES.INVALID_EXTENSION, detail: 'Invalid file extension: expected a .json file.'}]};
    }

    const {isValid, errors} = validateSaveContent(content);

    return {isValid, errors};
  }
}
