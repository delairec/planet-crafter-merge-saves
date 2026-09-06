import {ValidationIssue} from "./ValidationIssue";
import {ParsedSections} from "shared-save-processing/gameDefinitions";
import {SaveWarningCode} from "shared-save-processing/normalizeRawSections.js";

export interface LoadAndValidateSaveFilePresenterPort {
  presentInvalidSaveFile(errors: ValidationIssue[]): void;

  presentLoadedSaveFile(sections: ParsedSections, errors: string[], warnings: SaveWarningCode[]): void;
}
