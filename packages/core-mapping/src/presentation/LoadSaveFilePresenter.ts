import type {LoadAndValidateSaveFilePresenterPort} from "../application/ports/LoadAndValidateSaveFilePresenterPort.ts";
import type {ValidationIssue} from "../application/ports/ValidationIssue.ts";
import type {ParsedSections} from "shared-save-processing/gameDefinitions";
import type {SaveWarningCode} from "shared-save-processing/normalizeRawSections.js";
import type {LoadSaveFileViewModel} from "./viewModels/LoadSaveFileViewModel.ts";
import {formatValidationIssue} from "./formatValidationIssue.ts";
import {formatSaveWarning} from "./formatSaveWarning.ts";

export class LoadSaveFilePresenter implements LoadAndValidateSaveFilePresenterPort {
  private _viewModel: LoadSaveFileViewModel;

  constructor() {
    this._viewModel = {status: 'idle', sections: null, errorMessages: [], warnings: []};
  }

  get viewModel(): LoadSaveFileViewModel {
    return this._viewModel;
  }

  presentInvalidSaveFile(errors: ValidationIssue[], warnings: SaveWarningCode[]): void {
    this._viewModel = {status: 'invalid', sections: null, errorMessages: errors.map(formatValidationIssue), warnings: warnings.map(formatSaveWarning)};
  }

  presentLoadedSaveFile(sections: ParsedSections, errors: string[], warnings: SaveWarningCode[]): void {
    this._viewModel = {status: 'valid', sections, errorMessages: errors, warnings: warnings.map(formatSaveWarning)};
  }
}
