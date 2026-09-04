import {describe, expect, it, mock} from 'bun:test';
import {FakeSaveParserService} from "../testing/FakeSaveParserService";
import {SaveSectionsReaderPort} from "./ports/SaveSectionsReaderPort";
import {LoadTerraformationLevelsSection} from './LoadTerraformationLevelsSection';

describe('LoadTerraformationLevelsSection', () => {
  it('should present all terraformation levels from the parsed save', () => {
    // Arrange
    const saveParser: SaveSectionsReaderPort = new FakeSaveParserService();
    const presenter = {displayTerraformationLevels: mock()};
    const useCase = new LoadTerraformationLevelsSection(saveParser, presenter);

    // Act
    useCase.execute();

    // Assert
    expect(presenter.displayTerraformationLevels).toHaveBeenCalledTimes(1);
    expect(presenter.displayTerraformationLevels).toHaveBeenCalledWith([
      {
        planetId: 'Toxicity',
        unitOxygenLevel: 100,
        unitHeatLevel: 200,
        unitPressureLevel: 300,
        unitPlantsLevel: 400,
        unitInsectsLevel: 500,
        unitAnimalsLevel: 600,
        unitPurificationLevel: 700,
        terraformationIndex: 100 + 200 + 300 + 700 + 400 + 500 + 600,
        biomass: 400 + 500 + 600
      }
    ]);
  });
});
