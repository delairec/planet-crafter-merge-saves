import type {ValidationIssue} from "./ValidationIssue.ts";
import type {SaveWarningCode} from "shared-save-processing/normalizeRawSections.js";

export interface SaveFileValidationPresenterPort {
  presentValidSaveFile(warnings: SaveWarningCode[]): void;

  presentInvalidSaveFile(errors: ValidationIssue[], warnings: SaveWarningCode[]): void;
}
