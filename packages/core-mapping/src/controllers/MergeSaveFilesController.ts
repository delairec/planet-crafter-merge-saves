import {MergeResultViewModel} from "../presentation/viewModels/MergeResultViewModel";
import {createSaveFilesMerger, createSaveValidator} from "../composition/compositionRoot";
import {MergeResultPresenter} from "../presentation/MergeResultPresenter";
import {MergeSaveFiles} from "../application/MergeSaveFiles";

export class MergeSaveFilesController {
  static mergeSaveFiles(fileNameA: string, contentA: string, fileNameB: string, contentB: string): MergeResultViewModel {
    const validator = createSaveValidator();
    const merger = createSaveFilesMerger();
    const presenter = new MergeResultPresenter();
    const useCase = new MergeSaveFiles(validator, merger, presenter);

    useCase.execute(fileNameA, contentA, fileNameB, contentB);

    return presenter.viewModel;
  }
}
