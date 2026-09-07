import {ValidationIssue} from "./ValidationIssue";
import {SaveWarningCode} from "shared-save-processing/normalizeRawSections.js";

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
  /**
   * Adaptations the save needed to match the current format. Validation runs first in every flow,
   * so it is the only step able to warn before anything is displayed or rewritten: warnings are
   * reported here rather than by the parser, and on every outcome including an invalid save.
   */
  warnings: SaveWarningCode[];
}
