import {ParsedSections} from "shared-save-processing/gameDefinitions";

export interface LoadSaveFileViewModel {
  status: 'idle' | 'invalid' | 'valid';
  sections: ParsedSections | null;
  errorMessages: string[];
  /** Ready-to-display sentences, already translated from the save warning codes. */
  warnings: string[];
}
