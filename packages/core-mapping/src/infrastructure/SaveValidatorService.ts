import {hasJsonExtension} from "shared-save-processing/hasJsonExtension.js";
import {validateSaveContent} from "./validateSaveContent.js";
import type {SaveValidatorPort} from "../application/ports/SaveValidatorPort.ts";
import type {SaveValidationResult} from "../application/ports/SaveValidationResult.ts";
import {VALIDATION_ISSUE_CODES} from "../application/ports/ValidationIssue.ts";

export class SaveValidatorService implements SaveValidatorPort {
  validate(fileName: string, content: string): SaveValidationResult {
    if (!hasJsonExtension(fileName)) {
      return {isValid: false, errors: [{code: VALIDATION_ISSUE_CODES.INVALID_EXTENSION, detail: 'Invalid file extension: expected a .json file.'}], warnings: []};
    }

    const {isValid, errors, warnings} = validateSaveContent(content);

    return {isValid, errors, warnings};
  }
}
