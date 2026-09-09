import {SaveValidatorService} from "../infrastructure/SaveValidatorService";
import {SaveFilesMergerService} from "../infrastructure/SaveFilesMergerService";
import {SaveSectionsParserService} from "../infrastructure/SaveSectionsParserService";
import {SaveValidatorPort} from "../application/ports/SaveValidatorPort";
import {SaveFilesMergerPort} from "../application/ports/SaveFilesMergerPort";
import {SaveSectionsParserPort} from "../application/ports/SaveSectionsParserPort";

export function createSaveValidator(): SaveValidatorPort {
  return new SaveValidatorService();
}

export function createSaveFilesMerger(): SaveFilesMergerPort {
  return new SaveFilesMergerService();
}

export function createSaveSectionsParser(): SaveSectionsParserPort {
  return new SaveSectionsParserService();
}
