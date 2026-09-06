import type {ValidationIssue} from "./ValidationIssue.ts";
import type {ParsedSections} from "shared-save-processing/gameDefinitions";
import type {SaveWarningCode} from "shared-save-processing/normalizeRawSections.js";

export interface LoadAndValidateSaveFilePresenterPort {
  presentInvalidSaveFile(errors: ValidationIssue[], warnings: SaveWarningCode[]): void;

  presentLoadedSaveFile(sections: ParsedSections, errors: string[], warnings: SaveWarningCode[]): void;
}
