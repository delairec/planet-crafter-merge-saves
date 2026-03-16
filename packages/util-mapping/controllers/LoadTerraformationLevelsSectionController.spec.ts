import {describe, expect, it} from 'bun:test';
import {parseSaveSections} from '../../util-parsing/parseSaveSections.js';
import {createFakeSaveContent} from '../../util-testing/fixtures/createFakeSaveContent';
import {LoadTerraformationLevelsSectionController} from './LoadTerraformationLevelsSectionController';
import {TerraformationLevelsViewModel} from '../presentation/viewModels/TerraformationLevelsViewModel';

describe('LoadTerraformationLevelsSectionController', () => {
  it('should present terraformation levels from parsed save', () => {
    // Arrange
    const {sections} = parseSaveSections(createFakeSaveContent());

    // Act
    const viewModel = LoadTerraformationLevelsSectionController.loadTerraformationLevelsSection(sections);

    // Assert
    expect(viewModel).toEqual<TerraformationLevelsViewModel>({
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
            { value: "Toxicity" },
            { value: "100" },
            { value: "200" },
            { value: "300" },
            { value: "400" },
            { value: "500" },
            { value: "600" },
            { value: "700" }
          ]
        }
      ]
    });
  });
});
