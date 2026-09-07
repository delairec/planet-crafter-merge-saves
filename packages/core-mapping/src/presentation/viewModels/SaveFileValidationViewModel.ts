/**
 * `location` names where in the save the error was found, already worded for a reader; it is `null`
 * when the error concerns the file as a whole (a wrong extension, a wrong number of sections). It
 * stays apart from the message, so each delivery mechanism decides whether and where to show it.
 */
export interface SaveValidationErrorViewModel {
  message: string;
  location: string | null;
}

export interface SaveFileValidationViewModel {
  status: 'idle' | 'valid' | 'invalid';
  errorMessages: string[];
  errors: SaveValidationErrorViewModel[];
  warnings: string[];
}
