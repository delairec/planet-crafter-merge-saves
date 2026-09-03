import {SaveFileValidationPresenterPort} from "../application/ports/SaveFileValidationPresenterPort";
import {ValidationIssue} from "../application/ports/ValidationIssue";
import {SaveFileValidationViewModel} from "./viewModels/SaveFileValidationViewModel";

export class SaveFileValidationPresenter implements SaveFileValidationPresenterPort {
  viewModel: SaveFileValidationViewModel;

  constructor() {
    this.viewModel = {status: 'idle', errorMessages: []};
  }

  presentValidSaveFile(): void {
    this.viewModel = {status: 'valid', errorMessages: []};
  }

  presentInvalidSaveFile(errors: ValidationIssue[]): void {
    this.viewModel = {status: 'invalid', errorMessages: errors.map(formatValidationIssue)};
  }
}

function formatValidationIssue(issue: ValidationIssue): string {
  return issue.detail;
}
