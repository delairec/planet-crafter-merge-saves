import {TerraformationLevelsViewModel} from "./viewModels/TerraformationLevelsViewModel";
import {TerraformationLevel} from "../../util-types/gameDefinitions";
import {formatNumber} from "./formatters/formatNumber";

export class TerraformationLevelsPresenter {
  viewModel: TerraformationLevelsViewModel = {
    headers: [
      "planetId",
      "unitOxygenLevel",
      "unitHeatLevel",
      "unitPressureLevel",
      "unitPlantsLevel",
      "unitInsectsLevel",
      "unitAnimalsLevel",
      "unitPurificationLevel"
    ],
    rows: []
  };

  present(levels: TerraformationLevel[]): void {
    this.viewModel.rows = levels.map(level => ({
      cells: [
        { value: level.planetId },
        { value: formatNumber(level.unitOxygenLevel) },
        { value: formatNumber(level.unitHeatLevel) },
        { value: formatNumber(level.unitPressureLevel) },
        { value: formatNumber(level.unitPlantsLevel) },
        { value: formatNumber(level.unitInsectsLevel) },
        { value: formatNumber(level.unitAnimalsLevel) },
        { value: formatNumber(level.unitPurificationLevel) }
      ]
    }));
  }
}
