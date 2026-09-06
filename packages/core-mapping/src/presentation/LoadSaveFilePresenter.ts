import {LoadAndValidateSaveFilePresenterPort} from "../application/ports/LoadAndValidateSaveFilePresenterPort";
import {ValidationIssue} from "../application/ports/ValidationIssue";
import {ParsedSections} from "shared-save-processing/gameDefinitions";
import {SaveWarningCode} from "shared-save-processing/normalizeRawSections.js";
import {LoadSaveFileViewModel} from "./viewModels/LoadSaveFileViewModel";
import {formatValidationIssue} from "./formatValidationIssue";

export class LoadSaveFilePresenter implements LoadAndValidateSaveFilePresenterPort {
  private _viewModel: LoadSaveFileViewModel;

  constructor() {
    this._viewModel = {status: 'idle', sections: null, errorMessages: [], warnings: []};
  }

  get viewModel(): LoadSaveFileViewModel {
    return this._viewModel;
  }

  presentInvalidSaveFile(errors: ValidationIssue[]): void {
    this._viewModel = {status: 'invalid', sections: null, errorMessages: errors.map(formatValidationIssue), warnings: []};
  }

  presentLoadedSaveFile(sections: ParsedSections, errors: string[], warnings: SaveWarningCode[]): void {
    this._viewModel = {status: 'valid', sections, errorMessages: errors, warnings};
  }
}
