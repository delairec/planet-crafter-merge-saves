import {MergeResultPresenterPort, MergeOutcomeValueObject} from "../application/ports/MergeResultPresenterPort";
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

  present(outcome: MergeOutcomeValueObject): void {
    if (outcome.status === 'success') {
      this.viewModel = {
        status: 'success',
        fileName: outcome.fileName,
        content: outcome.content,
        saveAErrorMessages: [],
        saveBErrorMessages: []
      };
      return;
    }

    this.viewModel = {
      status: 'validationError',
      fileName: '',
      content: '',
      saveAErrorMessages: outcome.saveAErrorMessages,
      saveBErrorMessages: outcome.saveBErrorMessages
    };
  }
}
