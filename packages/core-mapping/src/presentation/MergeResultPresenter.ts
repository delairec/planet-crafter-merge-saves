import {MergeResultPresenterPort} from "../application/ports/MergeResultPresenterPort";
import {ValidationIssue} from "../application/ports/ValidationIssue";
import {SaveWarningCode} from "shared-save-processing/normalizeRawSections.js";
import {MergeResultViewModel} from "./viewModels/MergeResultViewModel";
import {formatValidationError} from "./formatValidationError";
import {formatSaveWarning} from "./formatSaveWarning";

export class MergeResultPresenter implements MergeResultPresenterPort {
  private _viewModel: MergeResultViewModel;

  constructor() {
    this._viewModel = {
      status: 'idle',
      fileName: '',
      content: '',
      saveAErrors: [],
      saveBErrors: [],
      saveAWarnings: [],
      saveBWarnings: []
    };
  }

  get viewModel(): MergeResultViewModel {
    return this._viewModel;
  }

  presentMergeSucceeded(fileName: string, content: string, saveAWarnings: SaveWarningCode[], saveBWarnings: SaveWarningCode[]): void {
    this._viewModel = {
      status: 'success',
      fileName,
      content,
      saveAErrors: [],
      saveBErrors: [],
      saveAWarnings: saveAWarnings.map(formatSaveWarning),
      saveBWarnings: saveBWarnings.map(formatSaveWarning)
    };
  }

  presentSaveFilesInvalid(saveAErrors: ValidationIssue[], saveBErrors: ValidationIssue[], saveAWarnings: SaveWarningCode[], saveBWarnings: SaveWarningCode[]): void {
    this._viewModel = {
      status: 'validationError',
      fileName: '',
      content: '',
      saveAErrors: saveAErrors.map(formatValidationError),
      saveBErrors: saveBErrors.map(formatValidationError),
      saveAWarnings: saveAWarnings.map(formatSaveWarning),
      saveBWarnings: saveBWarnings.map(formatSaveWarning)
    };
  }
}
