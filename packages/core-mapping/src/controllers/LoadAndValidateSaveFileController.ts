import type {LoadSaveFileViewModel} from "../presentation/viewModels/LoadSaveFileViewModel.ts";
import {createSaveSectionsParser, createSaveValidator} from "../composition/compositionRoot.ts";
import {LoadSaveFilePresenter} from "../presentation/LoadSaveFilePresenter.ts";
import {LoadAndValidateSaveFile} from "../application/LoadAndValidateSaveFile.ts";
import type {LoadAndValidateSaveFileRequest} from "../application/requests/LoadAndValidateSaveFileRequest.ts";

export class LoadAndValidateSaveFileController {
  static async loadAndValidateSaveFile(fileName: string, content: string): Promise<LoadSaveFileViewModel> {
    const request: LoadAndValidateSaveFileRequest = {fileName, content};
    const validator = createSaveValidator();
    const parser = createSaveSectionsParser();
    const presenter = new LoadSaveFilePresenter();
    const useCase = new LoadAndValidateSaveFile(validator, parser, presenter);

    await useCase.execute(request);

    return presenter.viewModel;
  }
}
