import {ValidationIssue} from "./ValidationIssue";
import {ParsedSections} from "shared-save-processing/gameDefinitions";

export interface LoadAndValidateSaveFilePresenterPort {
  presentInvalidSaveFile(errors: ValidationIssue[]): void;

  presentLoadedSaveFile(sections: ParsedSections, errors: string[], warnings: string[]): void;
}
