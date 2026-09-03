export const VALIDATION_ISSUE_CODES = {
  INVALID_EXTENSION: 'invalid-extension',
  INVALID_STRUCTURE: 'invalid-structure',
  INVALID_JSON: 'invalid-json',
  SCHEMA_VIOLATION: 'schema-violation',
  FLOAT_SERIALIZATION: 'float-serialization',
  UNIQUE_HOST: 'unique-host'
} as const;

export type ValidationIssueCode = typeof VALIDATION_ISSUE_CODES[keyof typeof VALIDATION_ISSUE_CODES];

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
