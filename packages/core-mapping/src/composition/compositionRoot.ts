import {SaveValidatorService} from "../infrastructure/SaveValidatorService.ts";
import {SaveFilesMergerService} from "../infrastructure/SaveFilesMergerService.ts";
import {SaveSectionsParserService} from "../infrastructure/SaveSectionsParserService.ts";
import type {SaveValidatorPort} from "../application/ports/SaveValidatorPort.ts";
import type {SaveFilesMergerPort} from "../application/ports/SaveFilesMergerPort.ts";
import type {SaveSectionsParserPort} from "../application/ports/SaveSectionsParserPort.ts";

export function createSaveValidator(): SaveValidatorPort {
  return new SaveValidatorService();
}

export function createSaveFilesMerger(): SaveFilesMergerPort {
  return new SaveFilesMergerService();
}

export function createSaveSectionsParser(): SaveSectionsParserPort {
  return new SaveSectionsParserService();
}
