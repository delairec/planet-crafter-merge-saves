import {SaveValidationResult} from "./SaveValidationResult";

export interface SaveValidatorPort {
  validate(fileName: string, content: string): SaveValidationResult;
}
