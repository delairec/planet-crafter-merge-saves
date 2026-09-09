import {SaveValidationMessageViewModel} from "./SaveFileValidationViewModel";

export interface MergeResultViewModel {
  status: 'idle' | 'success' | 'validationError';
  fileName: string;
  content: string;
  saveAErrors: SaveValidationMessageViewModel[];
  saveBErrors: SaveValidationMessageViewModel[];
  saveAWarnings: SaveValidationMessageViewModel[];
  saveBWarnings: SaveValidationMessageViewModel[];
}
