import {SAVE_WARNING_CODES, SaveWarningCode} from "shared-save-processing/normalizeRawSections.js";
import {SaveValidationMessageViewModel} from "./viewModels/SaveFileValidationViewModel";
import {legacySaveFormatWarningMessage, unknownSaveWarningMessage} from "./messages/saveWarningMessages.js";

/**
 * Every known warning code must have its own sentence: the `Record` makes a missing entry a type
 * error, and `formatSaveWarning.spec.ts` covers the same ground at runtime.
 */
const messagesByWarningCode: Record<SaveWarningCode, string> = {
  [SAVE_WARNING_CODES.LEGACY_SAVE_FORMAT]: legacySaveFormatWarningMessage
};

/**
 * Turns a save warning code into the warning shown to the user, in the same located shape as an
 * error. A code with no message falls back to a generic sentence, so the raw code is never
 * displayed. Warning codes describe the save as a whole, hence a location that is always `null`.
 */
export function formatSaveWarning(code: SaveWarningCode): SaveValidationMessageViewModel {
  return {message: messagesByWarningCode[code] ?? unknownSaveWarningMessage, location: null};
}
