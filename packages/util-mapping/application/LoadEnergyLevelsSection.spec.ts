import {describe, expect, it, mock} from 'bun:test';
import {SaveParserPort} from "./ports/SaveParserPort";
import {FakeSaveParserService} from "../../util-testing/fakes/FakeSaveParserService";
import {LoadEnergyLevelsSection} from "./LoadEnergyLevelsSection";

describe('LoadEnergyLevelsSection', () => {
  it('should present computed energy levels from parsed save', () => {
    // Arrange
    const saveParser: SaveParserPort = new FakeSaveParserService();
    const presenter = {present: mock()};
    const useCase = new LoadEnergyLevelsSection(saveParser, presenter);

    // Act
    useCase.execute();

    // Assert
    expect(presenter.present).toHaveBeenCalledTimes(1);
    expect(presenter.present).toHaveBeenCalledWith({
      production: 22_220.5,
      consumption: 11_110.5,
      available: 11_110
    });
  });
});
