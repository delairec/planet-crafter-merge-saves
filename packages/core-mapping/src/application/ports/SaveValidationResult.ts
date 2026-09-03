import {ValidationIssue} from "./ValidationIssue";

/**
 * Outcome of validating a save file's technical acceptability (extension, structural validity),
 * as reported by SaveValidatorPort. These are infrastructure-detected technical failures (bad
 * file extension, malformed JSON, schema violations), not domain business rule violations — this
 * type lives in application (co-located with the port that returns it) rather than domain, per
 * the "errors belong to the layer owning the concept" rule (see infrastructure.md).
 */
export interface SaveValidationResult {
  isValid: boolean;
  errors: ValidationIssue[];
}
