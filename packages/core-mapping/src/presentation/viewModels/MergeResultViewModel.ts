export interface MergeResultViewModel {
  status: 'idle' | 'success' | 'validationError';
  fileName: string;
  content: string;
  saveAErrorMessages: string[];
  saveBErrorMessages: string[];
  /** Ready-to-display sentences, already translated from the save warning codes. */
  saveAWarningMessages: string[];
  saveBWarningMessages: string[];
}
