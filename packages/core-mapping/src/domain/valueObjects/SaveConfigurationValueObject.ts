export interface SaveConfigurationValueObject {
  title: string;
  mode: string;
  modifiers: {
    terraformationPace: number;
    powerConsumption: number;
    gaugeDrain: number;
    meteoOccurrence: number;
    multiplayerFactor: number;
  }
}
