/**
 * A validation error with the place in the save where it was found: the section index and, inside
 * that section, the index of the entry. Both are absent when the error concerns the file as a whole
 * (a wrong extension, a wrong number of sections).
 *
 * The location stays structured rather than folded into the message, so each delivery mechanism
 * decides how to show it.
 */
export interface SaveValidationErrorViewModel {
  message: string;
  section?: number;
  entryIndex?: number;
}

export interface SaveFileValidationViewModel {
  status: 'idle' | 'valid' | 'invalid';
  errorMessages: string[];
  /** The same errors as `errorMessages`, each with the place in the save it was found. */
  errors: SaveValidationErrorViewModel[];
  /** Ready-to-display sentences, already translated from the save warning codes. */
  warnings: string[];
}
