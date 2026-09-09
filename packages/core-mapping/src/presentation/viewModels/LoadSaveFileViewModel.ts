import {ParsedSections} from "shared-save-processing/gameDefinitions";
import {SaveValidationMessageViewModel} from "./SaveFileValidationViewModel";

export interface LoadSaveFileViewModel {
  status: 'idle' | 'invalid' | 'valid';
  sections: ParsedSections | null;
  errors: SaveValidationMessageViewModel[];
  warnings: SaveValidationMessageViewModel[];
}
