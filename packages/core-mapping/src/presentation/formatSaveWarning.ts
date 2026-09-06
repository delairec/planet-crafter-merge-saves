import {SAVE_WARNING_CODES, type SaveWarningCode} from "shared-save-processing/normalizeRawSections.js";
import {legacySaveFormatWarningMessage, unknownSaveWarningMessage} from "./messages/saveWarningMessages.js";

/**
 * Every known warning code must have its own sentence: the `Record` makes a missing entry a type
 * error, and `formatSaveWarning.spec.ts` covers the same ground at runtime.
 */
const messagesByWarningCode: Record<SaveWarningCode, string> = {
  [SAVE_WARNING_CODES.LEGACY_SAVE_FORMAT]: legacySaveFormatWarningMessage
};

/**
 * Turns a save warning code into the sentence shown to the user. A code with no message falls back
 * to a generic sentence, so the raw code is never displayed.
 */
export function formatSaveWarning(code: SaveWarningCode): string {
  return messagesByWarningCode[code] ?? unknownSaveWarningMessage;
}
