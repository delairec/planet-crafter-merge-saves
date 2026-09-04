import {ValidationIssue} from "../application/ports/ValidationIssue";

export function formatValidationIssue(issue: ValidationIssue): string {
  return issue.detail;
}
