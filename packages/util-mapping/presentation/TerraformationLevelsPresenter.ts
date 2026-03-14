import {TerraformationLevelsViewModel} from "./viewModels/TerraformationLevelsViewModel";
import {TerraformationLevel} from "../../util-types/gameDefinitions";

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
        { value: String(level.planetId) },
        { value: String(level.unitOxygenLevel) },
        { value: String(level.unitHeatLevel) },
        { value: String(level.unitPressureLevel) },
        { value: String(level.unitPlantsLevel) },
        { value: String(level.unitInsectsLevel) },
        { value: String(level.unitAnimalsLevel) },
        { value: String(level.unitPurificationLevel) }
      ]
    }));
  }
}
