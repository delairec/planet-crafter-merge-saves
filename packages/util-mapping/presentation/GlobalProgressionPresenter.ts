import {GlobalProgressionViewModel} from './viewModels/GlobalProgressionViewModel';
import {GlobalProgressionPresenterPort} from '../application/ports/GlobalProgressionPresenterPort';
import {GlobalProgressionValueObject} from "../domain/valueObjects/GlobalProgressionValueObject";
import {formatNumber} from "./formatters/formatNumber";

export class GlobalProgressionPresenter implements GlobalProgressionPresenterPort {
  viewModel: GlobalProgressionViewModel;

  constructor() {
    this.viewModel = {
      tokens: {
        columns: [
          {
            header: 'All time Terra Tokens',
            values: []
          }
        ]
      },
    }
  }

  present(globalProgression: GlobalProgressionValueObject): void {
    const allTimeTerraTokens = formatNumber(globalProgression.allTimeTerraTokens);
    const [allTimeTerraTokensColumn] = this.viewModel.tokens.columns;
    allTimeTerraTokensColumn.values = [`${allTimeTerraTokens} =tt=`];
  }
}
