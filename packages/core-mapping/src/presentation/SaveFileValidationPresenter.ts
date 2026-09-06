import {SaveFileValidationPresenterPort} from "../application/ports/SaveFileValidationPresenterPort";
import {ValidationIssue} from "../application/ports/ValidationIssue";
import {SaveWarningCode} from "shared-save-processing/normalizeRawSections.js";
import {SaveFileValidationViewModel, SaveValidationErrorViewModel} from "./viewModels/SaveFileValidationViewModel";
import {formatValidationIssue} from "./formatValidationIssue";
import {formatSaveWarning} from "./formatSaveWarning";

function toValidationError(issue: ValidationIssue): SaveValidationErrorViewModel {
  const error: SaveValidationErrorViewModel = {message: formatValidationIssue(issue)};

  if (issue.section !== undefined) {
    error.section = issue.section;
  }

  if (issue.entryIndex !== undefined) {
    error.entryIndex = issue.entryIndex;
  }

  return error;
}

export class SaveFileValidationPresenter implements SaveFileValidationPresenterPort {
  private _viewModel: SaveFileValidationViewModel;

  constructor() {
    this._viewModel = {status: 'idle', errorMessages: [], errors: [], warnings: []};
  }

  get viewModel(): SaveFileValidationViewModel {
    return this._viewModel;
  }

  presentValidSaveFile(warnings: SaveWarningCode[]): void {
    this._viewModel = {status: 'valid', errorMessages: [], errors: [], warnings: warnings.map(formatSaveWarning)};
  }

  presentInvalidSaveFile(errors: ValidationIssue[], warnings: SaveWarningCode[]): void {
    this._viewModel = {
      status: 'invalid',
      errorMessages: errors.map(formatValidationIssue),
      errors: errors.map(toValidationError),
      warnings: warnings.map(formatSaveWarning)
    };
  }
}
