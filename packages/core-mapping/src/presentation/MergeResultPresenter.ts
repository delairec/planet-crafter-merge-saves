import {MergeResultPresenterPort} from "../application/ports/MergeResultPresenterPort";
import {ValidationIssue} from "../application/ports/ValidationIssue";
import {MergeResultViewModel} from "./viewModels/MergeResultViewModel";
import {formatValidationIssue} from "./formatValidationIssue";

export class MergeResultPresenter implements MergeResultPresenterPort {
  private _viewModel: MergeResultViewModel;

  constructor() {
    this._viewModel = {
      status: 'idle',
      fileName: '',
      content: '',
      saveAErrorMessages: [],
      saveBErrorMessages: []
    };
  }

  get viewModel(): MergeResultViewModel {
    return this._viewModel;
  }

  presentMergeSucceeded(fileName: string, content: string): void {
    this._viewModel = {
      status: 'success',
      fileName,
      content,
      saveAErrorMessages: [],
      saveBErrorMessages: []
    };
  }

  presentSaveFilesInvalid(saveAErrors: ValidationIssue[], saveBErrors: ValidationIssue[]): void {
    this._viewModel = {
      status: 'validationError',
      fileName: '',
      content: '',
      saveAErrorMessages: saveAErrors.map(formatValidationIssue),
      saveBErrorMessages: saveBErrors.map(formatValidationIssue)
    };
  }
}
