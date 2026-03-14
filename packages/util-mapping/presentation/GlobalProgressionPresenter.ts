import {GlobalProgressionViewModel} from './viewModels/GlobalProgressionViewModel';
import {GlobalProgressionPresenterPort} from '../application/ports/GlobalProgressionPresenterPort';
import {GlobalProgressionEntity} from "../domain/GlobalProgressionEntity";

export class GlobalProgressionPresenter implements GlobalProgressionPresenterPort {
  viewModel: GlobalProgressionViewModel;

  constructor() {
    this.viewModel = {
      headers: ['allTimeTerraTokens'],
      rows: []
    }
  }

  present(globalProgression: GlobalProgressionEntity): void {
    const allTimeTerraTokens = new Intl.NumberFormat().format(globalProgression.allTimeTerraTokens);
    this.viewModel.rows = [{
        cells: [{
          value: `${allTimeTerraTokens} =tt=`
        }]
      }];
  }
}
