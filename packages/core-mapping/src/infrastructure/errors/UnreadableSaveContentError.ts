import {SaveParseError} from "shared-save-processing/gameDefinitions";

/**
 * A save reached the merger carrying a line the save reader could not read. Every flow validates
 * both inputs before merging them, and validation reads them with that same reader, so getting
 * here means the invariant is broken rather than the user being at fault. The merge stops instead
 * of writing a save amputated of what could not be read; what the user is told about an unreadable
 * input stays the refusal validation issued before any merge.
 */
export class UnreadableSaveContentError extends Error {
  constructor(fileName: string, errors: SaveParseError[]) {
    super(`Save file "${fileName}" cannot be parsed: ${errors.map(error => error.detail).join('; ')}`);
    this.name = 'UnreadableSaveContentError';
  }
}
