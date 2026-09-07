import {SaveValidationErrorViewModel} from "./SaveFileValidationViewModel";

export interface MergeResultViewModel {
  status: 'idle' | 'success' | 'validationError';
  fileName: string;
  content: string;
  saveAErrors: SaveValidationErrorViewModel[];
  saveBErrors: SaveValidationErrorViewModel[];
  saveAWarningMessages: string[];
  saveBWarningMessages: string[];
}
