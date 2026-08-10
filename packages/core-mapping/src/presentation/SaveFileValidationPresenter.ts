import {SaveFileValidationPresenterPort} from "../application/ports/SaveFileValidationPresenterPort";
import {SaveFileValidationViewModel} from "./viewModels/SaveFileValidationViewModel";

export class SaveFileValidationPresenter implements SaveFileValidationPresenterPort {
  viewModel: SaveFileValidationViewModel;

  constructor() {
    this.viewModel = {status: 'idle', errorMessages: []};
  }

  presentValidSaveFile(): void {
    this.viewModel = {status: 'valid', errorMessages: []};
  }

  presentInvalidSaveFile(errorMessages: string[]): void {
    this.viewModel = {status: 'invalid', errorMessages};
  }
}
