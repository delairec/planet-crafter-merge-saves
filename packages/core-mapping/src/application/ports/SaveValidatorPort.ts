import type {SaveValidationResult} from "./SaveValidationResult.ts";

export interface SaveValidatorPort {
  validate(fileName: string, content: string): SaveValidationResult;
}
