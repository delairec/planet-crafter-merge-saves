import {stringifyEntry} from '../utils/stringifyEntry.js';

export function createFakeSaveString({
  globalMetadata,
  terraformationLevels = [],
  players = [],
  worldObjects = [],
  inventories = [],
  statistics = null,
  mailboxes = [],
  storyEvents = [],
  saveConfiguration = null,
  terrainLayers = [],
  worldEvents = []
}) {
  const sections = [
    createFakeGlobalMetadata(globalMetadata),
    createFakeTerraformationLevels(terraformationLevels),
    createFakePlayers(players),
    createFakeWorldObjects(worldObjects),
    createFakeInventories(inventories),
    createFakeStatistics(statistics),
    createFakeMailboxes(mailboxes),
    createFakeStoryEvents(storyEvents),
    createFakeSaveConfiguration(saveConfiguration),
    createFakeTerrainLayers(terrainLayers),
    createFakeWorldEvents(worldEvents),
  ];

  return sections.join('\n@\n') + '\n@';
}


function createFakeGlobalMetadata(globalMetadata = {
  terraTokens: 0,
  allTimeTerraTokens: 0,
  unlockedGroups: '',
  openedInstanceSeed: 0,
  openedInstanceTimeLeft: 0
}) {
  const {terraTokens, allTimeTerraTokens, unlockedGroups, openedInstanceSeed, openedInstanceTimeLeft} = globalMetadata;
  return `{"terraTokens":${terraTokens},"allTimeTerraTokens":${allTimeTerraTokens},"unlockedGroups":"${unlockedGroups}","openedInstanceSeed":${openedInstanceSeed},"openedInstanceTimeLeft":${openedInstanceTimeLeft}}`;
}

function createFakeTerraformationLevels(terraformationLevels = []) {
  return terraformationLevels.map(level => stringifyEntry(level)).join('|\n');
}

function createFakePlayers(players = []) {
  return players.map(player => stringifyEntry(player)).join('|\n');
}

function createFakeWorldObjects(worldObjects = []) {
  return worldObjects.map(worldObject => JSON.stringify(worldObject)).join('|\n');
}

function createFakeInventories(inventories = []) {
  return inventories.map(inventory => {
    return JSON.stringify(inventory);
  }).join('|\n');
}

function createFakeStatistics(statistics = null) {
  if (!statistics) return '';
  return JSON.stringify(statistics);
}

function createFakeMailboxes(mailboxes = []) {
  return mailboxes.map(mailbox => {
    return JSON.stringify(mailbox);
  }).join('|\n');
}

function createFakeStoryEvents(storyEvents = []) {
  return storyEvents.map(storyEvent => {
    return JSON.stringify(storyEvent);
  }).join('|\n');
}

function createFakeSaveConfiguration(saveConfiguration = null) {
  if (!saveConfiguration) return '';
  return JSON.stringify(saveConfiguration);
}

function createFakeTerrainLayers(terrainLayers = []) {
  return terrainLayers.map(layer => JSON.stringify(layer)).join('|\n');
}

function createFakeWorldEvents(worldEvents = []) {
  return worldEvents.map(worldEvent => JSON.stringify(worldEvent)).join('|\n');
}
