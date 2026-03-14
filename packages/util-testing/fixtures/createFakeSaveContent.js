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
export const worldObjects = [
  {id: 79111656, gId: 'Phytoplankton3'},
  {id: 58524136, gId: 'MagnetarQuartz'},
  {id: 85274195, gId: 'Backpack4'},
  {id: 48456321, gId: 'OxygenTank5'}
]
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
  modifierTerraformationPace: 1.0,
  modifierPowerConsumption: 1.0,
  modifierGaugeDrain: 1.0,
  modifierMeteoOccurence: 1.0,
  modifierMultiplayerTerraformationFactor: 1.0,
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

export const worldObjectsGenerator = (function* () {
  yield {id: '79111656', gId: 'Phytoplankton3'};
  yield {id: '58524136', gId: 'MagnetarQuartz'};
  yield {id: '85274195', gId: 'Backpack4'};
  yield {id: '48456321', gId: 'OxygenTank5'};
})();

export function createFakeSaveContent(overrides = {}) {
  return createFakeSaveString({
    globalMetadata: metadata,
    terraformationLevels: [terraformationLevel],
    players: [player],
    inventories: [inventory, equipment],
    worldObjects: worldObjects,
    statistics: statistics,
    saveConfiguration: saveConfiguration,
    ...overrides
  });
}
