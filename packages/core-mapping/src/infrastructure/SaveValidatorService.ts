import {validateMergedSave} from "cli-validate/validate.js";
import {SaveValidatorPort} from "../application/ports/SaveValidatorPort";
import {SaveValidationResultValueObject} from "../domain/valueObjects/SaveValidationResultValueObject";

export class SaveValidatorService implements SaveValidatorPort {
  validate(content: string): SaveValidationResultValueObject {
    const {isValid, errors} = validateMergedSave(content);

    return {
      isValid,
      errorMessages: errors.map((error) => error.message)
    };
  }
}
