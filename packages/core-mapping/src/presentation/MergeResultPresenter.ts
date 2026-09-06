import {MergeResultPresenterPort} from "../application/ports/MergeResultPresenterPort";
import {ValidationIssue} from "../application/ports/ValidationIssue";
import {SaveWarningCode} from "shared-save-processing/normalizeRawSections.js";
import {MergeResultViewModel} from "./viewModels/MergeResultViewModel";
import {formatValidationIssue} from "./formatValidationIssue";
import {formatSaveWarning} from "./formatSaveWarning";

export class MergeResultPresenter implements MergeResultPresenterPort {
  private _viewModel: MergeResultViewModel;

  constructor() {
    this._viewModel = {
      status: 'idle',
      fileName: '',
      content: '',
      saveAErrorMessages: [],
      saveBErrorMessages: [],
      saveAWarningMessages: [],
      saveBWarningMessages: []
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
      saveAErrorMessages: [],
      saveBErrorMessages: [],
      saveAWarningMessages: saveAWarnings.map(formatSaveWarning),
      saveBWarningMessages: saveBWarnings.map(formatSaveWarning)
    };
  }

  presentSaveFilesInvalid(saveAErrors: ValidationIssue[], saveBErrors: ValidationIssue[], saveAWarnings: SaveWarningCode[], saveBWarnings: SaveWarningCode[]): void {
    this._viewModel = {
      status: 'validationError',
      fileName: '',
      content: '',
      saveAErrorMessages: saveAErrors.map(formatValidationIssue),
      saveBErrorMessages: saveBErrors.map(formatValidationIssue),
      saveAWarningMessages: saveAWarnings.map(formatSaveWarning),
      saveBWarningMessages: saveBWarnings.map(formatSaveWarning)
    };
  }
}
