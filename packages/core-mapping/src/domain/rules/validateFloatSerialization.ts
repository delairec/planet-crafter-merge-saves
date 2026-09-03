import {VALIDATION_ISSUE_CODES} from "../../application/ports/ValidationIssue.ts";
import type {ValidationIssue} from "../../application/ports/ValidationIssue.ts";

/** Gauge and level fields must always serialize with a decimal point, even for whole values. */
const FLOAT_FIELDS = new Set([
  'unitOxygenLevel', 'unitHeatLevel', 'unitPressureLevel', 'unitPlantsLevel',
  'unitInsectsLevel', 'unitAnimalsLevel', 'unitPurificationLevel',
  'playerGaugeOxygen', 'playerGaugeThirst', 'playerGaugeHealth', 'playerGaugeToxic',
  'hunger'
]);

export function validateFloatSerialization(mergedSave: string): ValidationIssue[] {
  // Match "fieldName":integerValue — where value has no decimal point
  const floatFieldsPattern = Array.from(FLOAT_FIELDS).join('|');
  const regex = new RegExp(`"(${floatFieldsPattern})":(-)?(\\d+)(?![.\\d])`, 'g');

  const issues: ValidationIssue[] = [];
  let match;
  while ((match = regex.exec(mergedSave)) !== null) {
    issues.push({
      code: VALIDATION_ISSUE_CODES.FLOAT_SERIALIZATION,
      detail: `Field "${match[1]}" has integer value serialized without .0 suffix (got: ${match[2] ?? ''}${match[3]})`
    });
  }
  return issues;
}
