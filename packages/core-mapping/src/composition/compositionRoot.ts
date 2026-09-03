import {SaveValidatorService} from "../infrastructure/SaveValidatorService";
import {SaveFilesMergerService} from "../infrastructure/SaveFilesMergerService";
import {SaveValidatorPort} from "../application/ports/SaveValidatorPort";
import {SaveFilesMergerPort} from "../application/ports/SaveFilesMergerPort";

export function createSaveValidator(): SaveValidatorPort {
  return new SaveValidatorService();
}

export function createSaveFilesMerger(): SaveFilesMergerPort {
  return new SaveFilesMergerService();
}
