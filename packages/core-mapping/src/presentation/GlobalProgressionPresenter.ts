import {GlobalProgressionViewModel} from './viewModels/GlobalProgressionViewModel';
import {GlobalProgressionPresenterPort} from '../application/ports/GlobalProgressionPresenterPort';
import {GlobalProgressionValueObject} from "../domain/valueObjects/GlobalProgressionValueObject";
import {formatNumber} from "./formatters/formatNumber/formatNumber";
import {StatisticsValueObject} from "../domain/valueObjects/StatisticsValueObject";
import {
  globalProgressionSectionAllTimeTerraTokensLabel,
  globalProgressionSectionTotalCraftedObjectsLabel
} from "./messages/globalProgressionSectionMessages.js";

export class GlobalProgressionPresenter implements GlobalProgressionPresenterPort {
  private _viewModel: GlobalProgressionViewModel;

  constructor() {
    this._viewModel = {
      statistics: {
        columns: [
          {
            header: globalProgressionSectionAllTimeTerraTokensLabel,
            values: []
          },
          {
            header: globalProgressionSectionTotalCraftedObjectsLabel,
            values: []
          },
        ]
      },
    }
  }

  get viewModel(): GlobalProgressionViewModel {
    return this._viewModel;
  }

  displayGlobalProgression(globalProgression: GlobalProgressionValueObject, statistics: StatisticsValueObject | undefined): void {
    const allTimeTerraTokens = formatNumber(globalProgression.allTimeTerraTokens);

    this._viewModel = {
      statistics: {
        columns: [
          {
            header: globalProgressionSectionAllTimeTerraTokensLabel,
            values: [`${allTimeTerraTokens} =tt=`]
          },
          {
            header: globalProgressionSectionTotalCraftedObjectsLabel,
            values: [`${statistics?.totalCraftedObjects ?? 0}`]
          },
        ]
      }
    };
  }
}
