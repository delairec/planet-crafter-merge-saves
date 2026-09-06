import {ParsedSections} from "shared-save-processing/gameDefinitions";

export interface LoadSaveFileViewModel {
  status: 'idle' | 'invalid' | 'valid';
  sections: ParsedSections | null;
  errorMessages: string[];
  warnings: string[];
}
