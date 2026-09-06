import type {SaveFileValidationPresenterPort} from "../application/ports/SaveFileValidationPresenterPort.ts";
import type {ValidationIssue} from "../application/ports/ValidationIssue.ts";
import type {SaveWarningCode} from "shared-save-processing/normalizeRawSections.js";
import type {SaveFileValidationViewModel} from "./viewModels/SaveFileValidationViewModel.ts";
import {formatValidationIssue} from "./formatValidationIssue.ts";
import {formatValidationError} from "./formatValidationError.ts";
import {formatSaveWarning} from "./formatSaveWarning.ts";

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
