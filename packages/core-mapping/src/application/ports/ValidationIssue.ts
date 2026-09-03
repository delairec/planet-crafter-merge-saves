export type ValidationIssueCode =
  | 'invalid-extension'
  | 'invalid-structure'
  | 'invalid-json'
  | 'schema-violation'
  | 'float-serialization'
  | 'unique-host';

/**
 * A single validation failure, carrying a stable `code` for callers that need to branch on the
 * failure kind and a `detail` describing the specifics. Text formatting for end users happens in
 * presentation, not here — this keeps engine internals (ajv, domain rules) from leaking raw
 * library-formatted messages to the screen.
 */
export interface ValidationIssue {
  code: ValidationIssueCode;
  detail: string;
  section?: number;
  entryIndex?: number;
}
