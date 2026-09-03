import {MergeResultPresenterPort} from "../application/ports/MergeResultPresenterPort";
import {ValidationIssue} from "../application/ports/ValidationIssue";
import {MergeResultViewModel} from "./viewModels/MergeResultViewModel";

export class MergeResultPresenter implements MergeResultPresenterPort {
  viewModel: MergeResultViewModel;

  constructor() {
    this.viewModel = {
      status: 'idle',
      fileName: '',
      content: '',
      saveAErrorMessages: [],
      saveBErrorMessages: []
    };
  }

  presentMergeSucceeded(fileName: string, content: string): void {
    this.viewModel = {
      status: 'success',
      fileName,
      content,
      saveAErrorMessages: [],
      saveBErrorMessages: []
    };
  }

  presentSaveFilesInvalid(saveAErrors: ValidationIssue[], saveBErrors: ValidationIssue[]): void {
    this.viewModel = {
      status: 'validationError',
      fileName: '',
      content: '',
      saveAErrorMessages: saveAErrors.map(formatValidationIssue),
      saveBErrorMessages: saveBErrors.map(formatValidationIssue)
    };
  }
}

function formatValidationIssue(issue: ValidationIssue): string {
  return issue.detail;
}
