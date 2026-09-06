import type {MergeResultViewModel} from "../presentation/viewModels/MergeResultViewModel.ts";
import {createSaveFilesMerger, createSaveValidator} from "../composition/compositionRoot.ts";
import {MergeResultPresenter} from "../presentation/MergeResultPresenter.ts";
import {MergeSaveFiles} from "../application/MergeSaveFiles.ts";
import type {MergeSaveFilesRequest} from "../application/requests/MergeSaveFilesRequest.ts";

export class MergeSaveFilesController {
  static async mergeSaveFiles(request: MergeSaveFilesRequest): Promise<MergeResultViewModel> {
    const validator = createSaveValidator();
    const merger = createSaveFilesMerger();
    const presenter = new MergeResultPresenter();
    const useCase = new MergeSaveFiles(validator, merger, presenter);

    await useCase.execute(request);

    return presenter.viewModel;
  }
}
