import {SaveValidationResultValueObject} from "../../domain/valueObjects/SaveValidationResultValueObject";

export interface SaveValidatorPort {
  validate(content: string): SaveValidationResultValueObject;
}
