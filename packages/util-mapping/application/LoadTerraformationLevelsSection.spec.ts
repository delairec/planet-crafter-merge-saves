import {describe, expect, it, mock} from 'bun:test';
import {FakeSaveParserService} from "../../util-testing/fakes/FakeSaveParserService";
import {SaveParserPort} from "./ports/SaveParserPort";
import {LoadTerraformationLevelsSection} from './LoadTerraformationLevelsSection';

describe('LoadTerraformationLevelsSection', () => {
  it('should present all terraformation levels from the parsed save', () => {
    // Arrange
    const saveParser: SaveParserPort = new FakeSaveParserService();
    const presenter = {present: mock()};
    const useCase = new LoadTerraformationLevelsSection(saveParser, presenter);

    // Act
    useCase.execute();

    // Assert
    expect(presenter.present).toHaveBeenCalledTimes(1);
    expect(presenter.present).toHaveBeenCalledWith([
      {
        planetId: 'Toxicity',
        unitOxygenLevel: 100,
        unitHeatLevel: 200,
        unitPressureLevel: 300,
        unitPlantsLevel: 400,
        unitInsectsLevel: 500,
        unitAnimalsLevel: 600,
        unitPurificationLevel: 700
      }
    ]);
  });
});
