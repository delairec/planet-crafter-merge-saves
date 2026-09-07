import {ValidationIssue} from "../application/ports/ValidationIssue";
import {SaveValidationErrorViewModel} from "./viewModels/SaveFileValidationViewModel";
import {formatValidationIssue} from "./formatValidationIssue";
import {formatErrorLocation} from "./formatErrorLocation";

/**
 * Turns a validation issue into the error shown to the user: the message on one side, where in the
 * save it was found on the other.
 */
export function formatValidationError(issue: ValidationIssue): SaveValidationErrorViewModel {
  return {message: formatValidationIssue(issue), location: formatErrorLocation(issue)};
}
