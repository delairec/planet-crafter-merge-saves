import type {MergeResultPresenterPort} from "../application/ports/MergeResultPresenterPort.ts";
import type {ValidationIssue} from "../application/ports/ValidationIssue.ts";
import type {SaveWarningCode} from "shared-save-processing/normalizeRawSections.js";
import type {MergeResultViewModel} from "./viewModels/MergeResultViewModel.ts";
import {formatValidationIssue} from "./formatValidationIssue.ts";
import {formatSaveWarning} from "./formatSaveWarning.ts";

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
