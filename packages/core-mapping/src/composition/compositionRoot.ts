import {SaveValidatorService} from "../infrastructure/SaveValidatorService";
import {SaveFilesMergerService} from "../infrastructure/SaveFilesMergerService";

export function createSaveValidator() {
  return new SaveValidatorService();
}

export function createSaveFilesMerger() {
  return new SaveFilesMergerService();
}
