import {MergeResultViewModel} from "../presentation/viewModels/MergeResultViewModel";
import {createSaveFilesMerger, createSaveValidator} from "../composition/compositionRoot";
import {MergeResultPresenter} from "../presentation/MergeResultPresenter";
import {MergeSaveFiles} from "../application/MergeSaveFiles";
import {MergeSaveFilesRequest} from "../application/MergeSaveFilesRequest";

export class MergeSaveFilesController {
  static async mergeSaveFiles(fileNameA: string, contentA: string, fileNameB: string, contentB: string, saveDisplayName?: string): Promise<MergeResultViewModel> {
    const request: MergeSaveFilesRequest = {fileNameA, contentA, fileNameB, contentB, saveDisplayName};
    const validator = createSaveValidator();
    const merger = createSaveFilesMerger();
    const presenter = new MergeResultPresenter();
    const useCase = new MergeSaveFiles(validator, merger, presenter);

    await useCase.execute(request);

    return presenter.viewModel;
  }
}
