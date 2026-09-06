export interface SaveFileValidationViewModel {
  status: 'idle' | 'valid' | 'invalid';
  errorMessages: string[];
  /** Ready-to-display sentences, already translated from the save warning codes. */
  warnings: string[];
}
