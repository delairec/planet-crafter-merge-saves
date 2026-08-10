import {MergeResultPresenterPort} from "../application/ports/MergeResultPresenterPort";
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

  presentSaveFilesInvalid(saveAErrorMessages: string[], saveBErrorMessages: string[]): void {
    this.viewModel = {
      status: 'validationError',
      fileName: '',
      content: '',
      saveAErrorMessages,
      saveBErrorMessages
    };
  }
}
