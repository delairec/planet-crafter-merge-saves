import {describe, expect, it} from 'bun:test';
import {SaveConfigurationValueObject} from "../domain/valueObjects/SaveConfigurationValueObject";
import {SaveConfigurationViewModel} from "./viewModels/SaveConfigurationViewModel";
import {SaveConfigurationPresenter} from "./SaveConfigurationPresenter";

describe('SaveConfigurationPresenter', () => {
  it('should initialize with default view model', () => {
    // Act
    const presenter = new SaveConfigurationPresenter();

    // Assert
    expect(presenter.viewModel).toEqual<SaveConfigurationViewModel>({
      mode: '',
      title: '',
      modifiers: {
        columns: [
          {
            header: 'Terraformation Pace',
            values: []
          },
          {
            header: 'Gauge Drain',
            values: []
          },
          {
            header: 'Meteo Occurrence',
            values: []
          },
          {
            header: 'Multiplayer Factor',
            values: []
          },
          {
            header: 'Power Consumption',
            values: []
          }
        ]
      }
    });
  });

  it('should present the save configuration', () => {
    // Arrange
    const presenter = new SaveConfigurationPresenter();
    const saveConfiguration: SaveConfigurationValueObject = {
      mode: 'Standard',
      title: 'Fake Save',
      modifiers: {
        terraformationPace: 0.1,
        gaugeDrain: 0.2,
        meteoOccurrence: 0.3,
        multiplayerFactor: 0.4,
        powerConsumption: 0.5
      }
    };

    // Act
    presenter.present(saveConfiguration);

    // Assert
    expect(presenter.viewModel).toEqual<SaveConfigurationViewModel>({
      mode: 'Standard',
      title: 'Fake Save',
      modifiers: {
        columns: [
          {
            header: 'Terraformation Pace',
            values: ['10%']
          },
          {
            header: 'Gauge Drain',
            values: ['20%']
          },
          {
            header: 'Meteo Occurrence',
            values: ['30%']
          },
          {
            header: 'Multiplayer Factor',
            values: ['40%']
          },
          {
            header: 'Power Consumption',
            values: ['50%']
          }
        ]
      }
    });
  });
});
