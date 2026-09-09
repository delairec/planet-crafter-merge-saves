import {LoadAndValidateSaveFilePresenterPort} from "../application/ports/LoadAndValidateSaveFilePresenterPort";
import {ValidationIssue} from "../application/ports/ValidationIssue";
import {ParsedSections, SaveParseError} from "shared-save-processing/gameDefinitions";
import {SaveWarningCode} from "shared-save-processing/normalizeRawSections.js";
import {LoadSaveFileViewModel} from "./viewModels/LoadSaveFileViewModel";
import {formatValidationError} from "./formatValidationError";
import {formatErrorLocation} from "./formatErrorLocation";
import {formatSaveWarning} from "./formatSaveWarning";

export class LoadSaveFilePresenter implements LoadAndValidateSaveFilePresenterPort {
  private _viewModel: LoadSaveFileViewModel;

  constructor() {
    this._viewModel = {status: 'idle', sections: null, errors: [], warnings: []};
  }

  get viewModel(): LoadSaveFileViewModel {
    return this._viewModel;
  }

  presentInvalidSaveFile(errors: ValidationIssue[], warnings: SaveWarningCode[]): void {
    this._viewModel = {
      status: 'invalid',
      sections: null,
      errors: errors.map(formatValidationError),
      warnings: warnings.map(formatSaveWarning)
    };
  }

  /**
   * The errors of a save that parsed name the line the parser could not read, so they reach the
   * screen located like the validation ones.
   */
  presentLoadedSaveFile(sections: ParsedSections, errors: SaveParseError[], warnings: SaveWarningCode[]): void {
    this._viewModel = {
      status: 'valid',
      sections,
      errors: errors.map(error => ({message: error.detail, location: formatErrorLocation(error)})),
      warnings: warnings.map(formatSaveWarning)
    };
  }
}
