import {SaveParserPort} from './ports/SaveParserPort';
import {GlobalProgressionPresenterPort} from "./ports/GlobalProgressionPresenterPort";

export class LoadGlobalProgressionSection {
  constructor(
    private readonly saveParser: SaveParserPort,
    private readonly presenter: GlobalProgressionPresenterPort,
  ) {}

  execute(): void {
    const globalProgression = this.saveParser.getGlobalMetadata();
    this.presenter.present(globalProgression);
  }
}
