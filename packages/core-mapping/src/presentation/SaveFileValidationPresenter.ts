import {SaveFileValidationPresenterPort} from "../application/ports/SaveFileValidationPresenterPort";
import {ValidationIssue} from "../application/ports/ValidationIssue";
import {SaveWarningCode} from "shared-save-processing/normalizeRawSections.js";
import {SaveFileValidationViewModel} from "./viewModels/SaveFileValidationViewModel";
import {formatValidationIssue} from "./formatValidationIssue";
import {formatValidationError} from "./formatValidationError";
import {formatSaveWarning} from "./formatSaveWarning";

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
      errors: errors.map(formatValidationError),
      warnings: warnings.map(formatSaveWarning)
    };
  }
}
