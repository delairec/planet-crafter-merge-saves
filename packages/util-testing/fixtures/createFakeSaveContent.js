import {createFakeSaveString} from './createFakeSaveString.js';

export const player = {
  id: 76561198155441595,
  name: 'Nikowa',
  inventoryId: 44,
  equipmentId: 45,
  playerPosition: '1751.865,472.58,-1106.104',
  playerRotation: '0,0.5740051,0,-0.8188518',
  playerGaugeOxygen: 280.0,
  playerGaugeThirst: 96.3858642578125,
  playerGaugeHealth: 72.67363739013672,
  playerGaugeToxic: 0.0,
  host: true,
  planetId: 'Toxicity'
};
export const inventory = {id: 44, woIds: '79111656,58524136', size: 20};
export const equipment = {id: 45, woIds: '85274195,48456321', size: 10};
export const inventory2 = {id: 46, woIds: '15974863,28491667', size: 20};
export const equipment2 = {id: 47, woIds: '39187611,65514812', size: 10};
export const worldObjects = [
  {id: 79111656, gId: 'Phytoplankton3'},
  {id: 58524136, gId: 'MagnetarQuartz'},
  {id: 85274195, gId: 'Backpack4'},
  {id: 48456321, gId: 'OxygenTank5'},
  {id: 15974863, gId: 'Phytoplankton1'},
  {id: 28491667, gId: 'PulsarQuartz'},
  {id: 39187611, gId: 'Backpack7'},
  {id: 65514812, gId: 'OxygenTank4'},
  {id: 95585241, gId: 'EnergyGenerator1'},
  {id: 95585242, gId: 'EnergyGenerator2'},
  {id: 95585243, gId: 'EnergyGenerator3'},
  {id: 95585244, gId: 'EnergyGenerator4'},
  {id: 95585245, gId: 'EnergyGenerator5'},
  {id: 95585246, gId: 'EnergyGenerator6'},
  {id: 95585246, gId: 'WindTurbine1'},
];
export const saveConfiguration = {
  saveDisplayName: 'Merged Save',
  planetId: 'Toxicity',
  unlockedSpaceTrading: false,
  unlockedOreExtrators: false,
  unlockedTeleporters: false,
  unlockedDrones: false,
  unlockedAutocrafter: false,
  unlockedEverything: false,
  freeCraft: false,
  preInterplanetarySave: false,
  randomizeMineables: false,
  modifierTerraformationPace: 0.1,
  modifierPowerConsumption: 0.2,
  modifierGaugeDrain: 0.3,
  modifierMeteoOccurence: 0.4,
  modifierMultiplayerTerraformationFactor: 0.5,
  modded: false,
  version: '1.0',
  mode: 'Standard',
  dyingConsequencesLabel: 'DropSomeItems',
  startLocationLabel: 'Standard',
  worldSeed: 42,
  hasPlayedIntro: true,
  gameStartLocation: 'Standard'
};
export const metadata = {
  terraTokens: 100,
  allTimeTerraTokens: 200_345,
  unlockedGroups: 'BootsSpeed1',
  openedInstanceSeed: 0,
  openedInstanceTimeLeft: 0
};
export const terraformationLevel = {
  planetId: 'Toxicity',
  unitOxygenLevel: 100.0,
  unitHeatLevel: 200.0,
  unitPressureLevel: 300.0,
  unitPlantsLevel: 400.0,
  unitInsectsLevel: 500.0,
  unitAnimalsLevel: 600.0,
  unitPurificationLevel: 700.0
};
export const statistics = {
  craftedObjects: 10,
  totalSaveFileLoad: 5,
  totalSaveFileTime: 3600
};

export function createFakeSaveContent(overrides = {}) {
  return createFakeSaveString({
    globalMetadata: metadata,
    terraformationLevels: [terraformationLevel],
    players: [player],
    inventories: [inventory, equipment, inventory2, equipment2],
    worldObjects: worldObjects,
    statistics: statistics,
    saveConfiguration: saveConfiguration,
    ...overrides
  });
}
