/** @import { Player, Inventory, SaveConfiguration, GlobalMetadata, TerraformationLevel, Statistics } from '../gameDefinitions' */

// Factories for the individual records of a save file, in business language. Used both by
// `createFakeSaveContent` (save string) and by `createFakeParsedSave` (already parsed sections).

/**
 * @param {Partial<Player>} overrides
 * @returns {Player}
 */
export function createPlayer(overrides = {}) {
  return {
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
    planetId: 'Toxicity',
    cameraView: 0,
    totalCraftedObjects: 1820,
    totalTerraTokenEarned: 9000,
    ...overrides
  };
}

/**
 * @param {Partial<Inventory>} overrides
 * @returns {Inventory}
 */
export function createInventory(overrides = {}) {
  return {id: 44, woIds: '79111656,58524136', size: 20, ...overrides};
}

/**
 * @param {Partial<Inventory>} overrides
 * @returns {Inventory}
 */
export function createEquipment(overrides = {}) {
  return {id: 45, woIds: '85274195,48456321', size: 10, ...overrides};
}

/**
 * @param {Partial<SaveConfiguration>} overrides
 * @returns {SaveConfiguration}
 */
export function createSaveConfiguration(overrides = {}) {
  return {
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
    gameStartLocation: 'Standard',
    ...overrides
  };
}

/**
 * @param {Partial<GlobalMetadata>} overrides
 * @returns {GlobalMetadata}
 */
export function createGlobalMetadata(overrides = {}) {
  return {
    terraTokens: 100,
    allTimeTerraTokens: 200_345,
    unlockedGroups: 'BootsSpeed1',
    openedInstanceSeed: 0,
    openedInstanceTimeLeft: 0,
    ...overrides
  };
}

/**
 * @param {Partial<TerraformationLevel>} overrides
 * @returns {TerraformationLevel}
 */
export function createTerraformationLevel(overrides = {}) {
  return {
    planetId: 'Toxicity',
    unitOxygenLevel: 100.0,
    unitHeatLevel: 200.0,
    unitPressureLevel: 300.0,
    unitPlantsLevel: 400.0,
    unitInsectsLevel: 500.0,
    unitAnimalsLevel: 600.0,
    unitPurificationLevel: 700.0,
    ...overrides
  };
}

/**
 * @param {Partial<Statistics>} overrides
 * @returns {Statistics}
 */
export function createStatistics(overrides = {}) {
  return {
    craftedObjects: 10,
    totalSaveFileLoad: 5,
    totalSaveFileTime: 3600,
    ...overrides
  };
}

