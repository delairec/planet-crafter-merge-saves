import {ValidationIssue} from "./ValidationIssue";

export interface SaveFileValidationPresenterPort {
  presentValidSaveFile(): void;

  presentInvalidSaveFile(errors: ValidationIssue[]): void;
}
