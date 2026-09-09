import {ValidationIssue} from "./ValidationIssue";
import {ParsedSections, SaveParseError} from "shared-save-processing/gameDefinitions";
import {SaveWarningCode} from "shared-save-processing/normalizeRawSections.js";

export interface LoadAndValidateSaveFilePresenterPort {
  presentInvalidSaveFile(errors: ValidationIssue[], warnings: SaveWarningCode[]): void;

  presentLoadedSaveFile(sections: ParsedSections, errors: SaveParseError[], warnings: SaveWarningCode[]): void;
}
