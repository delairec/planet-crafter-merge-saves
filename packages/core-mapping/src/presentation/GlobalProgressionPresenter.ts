import {GlobalProgressionViewModel} from './viewModels/GlobalProgressionViewModel';
import {GlobalProgressionPresenterPort} from '../application/ports/GlobalProgressionPresenterPort';
import {GlobalProgressionValueObject} from "../domain/valueObjects/GlobalProgressionValueObject";
import {formatNumber} from "./formatters/formatNumber/formatNumber";
import {StatisticsValueObject} from "../domain/valueObjects/StatisticsValueObject";
import {
  globalProgressionSectionAllTimeTerraTokensLabel,
  globalProgressionSectionTotalCraftedObjectsLabel
} from "../../../util-messages/globalProgressionSectionMessages.js";

export class GlobalProgressionPresenter implements GlobalProgressionPresenterPort {
  viewModel: GlobalProgressionViewModel;

  constructor() {
    this.viewModel = {
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

  displayGlobalProgression(globalProgression: GlobalProgressionValueObject, statistics: StatisticsValueObject): void {
    const allTimeTerraTokens = formatNumber(globalProgression.allTimeTerraTokens);
    const [allTimeTerraTokensColumn, totalCrafterObjects] = this.viewModel.statistics.columns;
    allTimeTerraTokensColumn.values = [`${allTimeTerraTokens} =tt=`];
    totalCrafterObjects.values = [`${statistics.totalCraftedObjects}`];
  }
}
