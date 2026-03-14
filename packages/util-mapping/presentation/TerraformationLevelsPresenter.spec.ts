import {describe, expect, it} from 'bun:test';
import {TerraformationLevelsPresenter} from './TerraformationLevelsPresenter';
import {TerraformationLevelsViewModel} from './viewModels/TerraformationLevelsViewModel';

describe('TerraformationLevelsPresenter', () => {
  it('should initialize with default view model', () => {
    // Act
    const presenter = new TerraformationLevelsPresenter();

    // Assert
    expect(presenter.viewModel).toEqual<TerraformationLevelsViewModel>({
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
    });
  });

  it('should present all terraformation levels', () => {
    // Arrange
    const presenter = new TerraformationLevelsPresenter();

    // Act
    presenter.present([
      {
        planetId: "Earth",
        unitOxygenLevel: 123,
        unitHeatLevel: 456,
        unitPressureLevel: 789,
        unitPlantsLevel: 101,
        unitInsectsLevel: 112,
        unitAnimalsLevel: 131,
        unitPurificationLevel: 415
      }
    ]);

    // Assert
    expect(presenter.viewModel).toEqual<TerraformationLevelsViewModel>({
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
      rows: [
        {
          cells: [
            { value: "Earth" },
            { value: "123" },
            { value: "456" },
            { value: "789" },
            { value: "101" },
            { value: "112" },
            { value: "131" },
            { value: "415" }
          ]
        }
      ]
    });
  });
});
