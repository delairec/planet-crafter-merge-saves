import {describe, expect, it} from 'bun:test';
import {createSaveConfigurationValueObject} from './SaveConfigurationValueObject.ts';
import {InvalidSaveDataError} from '../errors/InvalidSaveDataError.ts';

describe('SaveConfigurationValueObject', () => {
  it('should build a save configuration value object from valid data', () => {
    // Arrange
    const input = {
      title: 'Merged Save',
      mode: 'Standard',
      modifiers: {
        terraformationPace: 0.1,
        powerConsumption: 0.2,
        gaugeDrain: 0.3,
        meteoOccurrence: 0.4,
        multiplayerFactor: 0.5
      }
    };

    // Act
    const saveConfiguration = createSaveConfigurationValueObject(input);

    // Assert
    expect(saveConfiguration).toEqual(input);
  });

  it('should reject a non-finite modifier', () => {
    // Arrange
    const input = {
      title: 'Merged Save',
      mode: 'Standard',
      modifiers: {
        terraformationPace: NaN,
        powerConsumption: 0.2,
        gaugeDrain: 0.3,
        meteoOccurrence: 0.4,
        multiplayerFactor: 0.5
      }
    };

    // Act & Assert
    expect(() => createSaveConfigurationValueObject(input)).toThrow(InvalidSaveDataError);
  });
});
