/**
 * `section` and `entryIndex` are absent when the error concerns the file as a whole (a wrong
 * extension, a wrong number of sections). The location stays structured rather than folded into the
 * message, so each delivery mechanism decides how to show it.
 */
export interface SaveValidationErrorViewModel {
  message: string;
  section?: number;
  entryIndex?: number;
}

export interface SaveFileValidationViewModel {
  status: 'idle' | 'valid' | 'invalid';
  errorMessages: string[];
  errors: SaveValidationErrorViewModel[];
  warnings: string[];
}
