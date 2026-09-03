import {SaveSectionsReaderService} from "../infrastructure/SaveSectionsReaderService";
import {SaveValidatorService} from "../infrastructure/SaveValidatorService";
import {SaveFilesMergerService} from "../infrastructure/SaveFilesMergerService";
import {ParsedSections} from "shared-save-processing/gameDefinitions";

export function createSaveParser(sections: ParsedSections) {
  return new SaveSectionsReaderService(sections);
}

export function createSaveValidator() {
  return new SaveValidatorService();
}

export function createSaveFilesMerger() {
  return new SaveFilesMergerService();
}
