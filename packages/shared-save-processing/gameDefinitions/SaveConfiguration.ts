export interface SaveConfiguration {
  saveDisplayName: string;
  planetId: string;
  version: string;
  mode: string;
  worldSeed: number;
  modded: boolean;
  modifierTerraformationPace: number;
  modifierPowerConsumption: number;
  modifierGaugeDrain: number;
  modifierMeteoOccurence: number;
  modifierMultiplayerTerraformationFactor: number;
  // Extra
  unlockedSpaceTrading: boolean;
  unlockedOreExtrators: boolean;
  unlockedTeleporters: boolean;
  unlockedDrones: boolean;
  unlockedAutocrafter: boolean;
  unlockedEverything: boolean;
  freeCraft: boolean;
  preInterplanetarySave: boolean;
  randomizeMineables: boolean;
  dyingConsequencesLabel: string;
  startLocationLabel: string;
  hasPlayedIntro: boolean;
  gameStartLocation: string;
}
