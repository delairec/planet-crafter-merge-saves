/** @import { WorldObject } from '../gameDefinitions' */

import {createFakeSaveString} from './createFakeSaveString.js';
import {
  createEquipment,
  createGlobalMetadata,
  createInventory,
  createPlayer,
  createSaveConfiguration,
  createStatistics,
  createTerraformationLevel
} from './createSaveRecords.js';

export {
  createEquipment,
  createGlobalMetadata,
  createInventory,
  createPlayer,
  createSaveConfiguration,
  createStatistics,
  createTerraformationLevel
};

/**
 * @returns {WorldObject[]}
 */
function createDefaultWorldObjects() {
  return [
    {id: 79111656, gId: 'Phytoplankton3'},
    {id: 58524136, gId: 'MagnetarQuartz'},
    {id: 85274195, gId: 'Backpack4'},
    {id: 48456321, gId: 'OxygenTank5'},
    {id: 15974863, gId: 'Phytoplankton1'},
    {id: 28491667, gId: 'PulsarQuartz'},
    {id: 39187611, gId: 'Backpack7'},
    {id: 65514812, gId: 'OxygenTank4'},
    {id: 95585241, gId: 'EnergyGenerator1', pos: '0,0,0', planet: 1},
    {id: 95585242, gId: 'EnergyGenerator2', pos: '1,0,0', planet: 1},
    {id: 95585243, gId: 'EnergyGenerator3', pos: '2,0,0', planet: 1},
    {id: 95585244, gId: 'EnergyGenerator4', pos: '3,0,0', planet: 1},
    {id: 95585245, gId: 'EnergyGenerator5', pos: '4,0,0', planet: 1},
    {id: 95585246, gId: 'EnergyGenerator6', pos: '5,0,0', planet: 1},
    {id: 95585249, gId: 'WindTurbine1', pos: '6,0,0', planet: 1},
    {id: 95585247, gId: 'Drill0', pos: '7,0,0', planet: 1},
    {id: 95585248, gId: 'Heater1', pos: '8,0,0', planet: 1},
  ];
}

export function createFakeSaveContent(overrides = {}) {
  return createFakeSaveString({
    globalMetadata: createGlobalMetadata(),
    terraformationLevels: [createTerraformationLevel()],
    players: [createPlayer()],
    inventories: [
      createInventory(),
      createEquipment(),
      createInventory({id: 46, woIds: '15974863,28491667'}),
      createEquipment({id: 47, woIds: '39187611,65514812'})
    ],
    worldObjects: createDefaultWorldObjects(),
    statistics: createStatistics(),
    saveConfiguration: createSaveConfiguration(),
    ...overrides
  });
}
