import {assertFiniteNumber, assertNonEmptyString} from "../errors/assertions";

export interface SaveConfigurationValueObject {
  readonly title: string;
  readonly mode: string;
  readonly modifiers: {
    readonly terraformationPace: number;
    readonly powerConsumption: number;
    readonly gaugeDrain: number;
    readonly meteoOccurrence: number;
    readonly multiplayerFactor: number;
  }
}

export function createSaveConfigurationValueObject(input: SaveConfigurationValueObject): SaveConfigurationValueObject {
  return {
    title: assertNonEmptyString(input.title, 'SaveConfigurationValueObject.title'),
    mode: assertNonEmptyString(input.mode, 'SaveConfigurationValueObject.mode'),
    modifiers: {
      terraformationPace: assertFiniteNumber(input.modifiers.terraformationPace, 'SaveConfigurationValueObject.modifiers.terraformationPace'),
      powerConsumption: assertFiniteNumber(input.modifiers.powerConsumption, 'SaveConfigurationValueObject.modifiers.powerConsumption'),
      gaugeDrain: assertFiniteNumber(input.modifiers.gaugeDrain, 'SaveConfigurationValueObject.modifiers.gaugeDrain'),
      meteoOccurrence: assertFiniteNumber(input.modifiers.meteoOccurrence, 'SaveConfigurationValueObject.modifiers.meteoOccurrence'),
      multiplayerFactor: assertFiniteNumber(input.modifiers.multiplayerFactor, 'SaveConfigurationValueObject.modifiers.multiplayerFactor')
    }
  };
}
