import {describe, expect, it, mock} from "bun:test";
import {SaveParserPort} from "./ports/SaveParserPort";
import {FakeSaveParserService} from "../testing/FakeSaveParserService";
import {SaveConfigurationPresenterPort} from "./ports/SaveConfigurationPresenterPort";
import {LoadSaveConfigurationSection} from "./LoadSaveConfigurationSection";

describe('LoadSaveConfigurationSection', () => {
  it('should present save configuration from the parsed save', () => {
    // Arrange
    const saveParser: SaveParserPort = new FakeSaveParserService();
    const presenter: SaveConfigurationPresenterPort = {displaySaveConfiguration: mock()}
    const useCase = new LoadSaveConfigurationSection(saveParser, presenter);

    // Act
    useCase.execute();

    // Assert
    expect(presenter.displaySaveConfiguration).toHaveBeenCalledTimes(1);
    expect(presenter.displaySaveConfiguration).toHaveBeenCalledWith({
        mode: 'Standard',
        title: 'Fake Save',
        modifiers: {
          terraformationPace: 0.1,
          gaugeDrain: 0.2,
          meteoOccurrence: 0.3,
          multiplayerFactor: 0.4,
          powerConsumption: 0.5
        }
      });
  });
});
