import type {ValidationIssue} from "../application/ports/ValidationIssue.ts";

export function formatValidationIssue(issue: ValidationIssue): string {
  return issue.detail;
}
