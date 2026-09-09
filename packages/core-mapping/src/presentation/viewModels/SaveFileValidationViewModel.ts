/**
 * A message the validation produced for the user, error or warning alike: only the field carrying it
 * tells the severity. `location` names where in the save it was found, already worded for a reader;
 * it is `null` when the message concerns the file as a whole (a wrong extension, a wrong number of
 * sections, a save adapted from an older format). It stays apart from the message, so each delivery
 * mechanism decides whether and where to show it.
 */
export interface SaveValidationMessageViewModel {
  message: string;
  location: string | null;
}

export interface SaveFileValidationViewModel {
  status: 'idle' | 'valid' | 'invalid';
  errors: SaveValidationMessageViewModel[];
  warnings: SaveValidationMessageViewModel[];
}
