import {ValidationIssue} from "../application/ports/ValidationIssue";
import {SaveValidationErrorViewModel} from "./viewModels/SaveFileValidationViewModel";
import {formatValidationIssue} from "./formatValidationIssue";

/**
 * Turns a validation issue into the error shown to the user, keeping where in the save it was
 * found. The location keys are left out rather than set to `undefined`, so an error concerning the
 * whole file carries no location at all.
 */
export function formatValidationError(issue: ValidationIssue): SaveValidationErrorViewModel {
  const error: SaveValidationErrorViewModel = {message: formatValidationIssue(issue)};

  if (issue.section !== undefined) {
    error.section = issue.section;
  }

  if (issue.entryIndex !== undefined) {
    error.entryIndex = issue.entryIndex;
  }

  return error;
}
