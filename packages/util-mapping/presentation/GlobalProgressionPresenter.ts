import {GlobalProgressionViewModel} from './viewModels/GlobalProgressionViewModel';
import {GlobalProgressionPresenterPort} from '../application/ports/GlobalProgressionPresenterPort';
import {GlobalProgressionValueObject} from "../domain/valueObjects/GlobalProgressionValueObject";

export class GlobalProgressionPresenter implements GlobalProgressionPresenterPort {
  viewModel: GlobalProgressionViewModel;

  constructor() {
    this.viewModel = {
      headers: ['allTimeTerraTokens'],
      rows: []
    }
  }

  present(globalProgression: GlobalProgressionValueObject): void {
    const allTimeTerraTokens = new Intl.NumberFormat().format(globalProgression.allTimeTerraTokens);
    this.viewModel.rows = [{
        cells: [{
          value: `${allTimeTerraTokens} =tt=`
        }]
      }];
  }
}
