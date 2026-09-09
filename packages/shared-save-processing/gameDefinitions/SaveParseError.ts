/**
 * A failure met while reading a save. A line that cannot be read carries where it was found; a
 * failure about the file as a whole carries only its detail.
 *
 * The shape stays free of any consumer vocabulary: `core-mapping` turns it into a `ValidationIssue`
 * with its own code, which `shared-save-processing` must not depend on.
 */
export interface SaveParseError {
  detail: string;
  section?: number;
  entryIndex?: number;
}
