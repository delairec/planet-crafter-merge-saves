export interface MergeResultViewModel {
  status: 'idle' | 'success' | 'validationError';
  fileName: string;
  content: string;
  saveAErrorMessages: string[];
  saveBErrorMessages: string[];
  saveAWarningMessages: string[];
  saveBWarningMessages: string[];
}
