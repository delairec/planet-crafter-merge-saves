import {ParsedSections} from "shared-save-processing/gameDefinitions";
import {SaveValidationErrorViewModel} from "./SaveFileValidationViewModel";

export interface LoadSaveFileViewModel {
  status: 'idle' | 'invalid' | 'valid';
  sections: ParsedSections | null;
  errorMessages: string[];
  errors: SaveValidationErrorViewModel[];
  warnings: string[];
}
