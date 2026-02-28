import {parseSaveSections} from './utils/parseSaveSections.js';
import {stringifyEntry} from './utils/stringifyEntry.js';

export function determineSaveOrder(saveA, saveB) {
  const [, , , , , , , , saveConfigurationsA] = parseSaveSections(saveA);
  const [, , , , , , , , saveConfigurationsB] = parseSaveSections(saveB);

  const configA = saveConfigurationsA?.[0];
  const configB = saveConfigurationsB?.[0];

  const save1IsPrime = configA?.planetId === 'Prime';
  const save2IsPrime = configB?.planetId === 'Prime';

  if (save2IsPrime && !save1IsPrime) {
    return [saveB, saveA];
  }

  return [saveA, saveB];
}

export function mergeSaves(saveA, saveB, saveDisplayName) {
  const [metadataA = [], terraformationLevelsA = [], playersA = [], worldObjectsGeneratorA = '', inventoriesA = [], statisticsA = [], mailboxA = [], storyEventsA = [], saveConfigurationsA = [], terrainLayersA = [], worldEventsA = []] = parseSaveSections(saveA);
  const [metadataB = [], terraformationLevelsB = [], playersB = [], worldObjectsGeneratorB = '', inventoriesB = [], statisticsB = [], mailboxB = [], storyEventsB = [], saveConfigurationsB = [], terrainLayersB = [], worldEventsB = []] = parseSaveSections(saveB);

  const ejectedPlayerIdsFromB = collectEjectedPlayerInventoryIds(playersA, playersB, inventoriesB);

  const sections = [
    mergeGlobalMetadata(metadataA, metadataB),
    mergeTerraformationLevels(terraformationLevelsA, terraformationLevelsB),
    mergePlayers(playersA, playersB),
    mergeWorldObjects(worldObjectsGeneratorA, worldObjectsGeneratorB, ejectedPlayerIdsFromB.orphanWorldObjectIds),
    mergeInventories(inventoriesA, inventoriesB, ejectedPlayerIdsFromB.orphanInventoryIds),
    mergeStatistics(statisticsA, statisticsB),
    mergeMailboxes(mailboxA, mailboxB),
    mergeStoryEvents(storyEventsA, storyEventsB),
    mergeSaveConfigurations(saveConfigurationsA, saveConfigurationsB, saveDisplayName),
    mergeTerrainLayers(terrainLayersA, terrainLayersB),
    mergeWorldEvents(worldEventsA, worldEventsB),
  ];

  return sections.join('\n@\n') + '\n@';
}

function collectEjectedPlayerInventoryIds(playersA, playersB, inventoriesB) {
  const ejectedPlayersFromB = (playersB ?? []).filter(playerB =>
    (playersA ?? []).some(playerA => playerA.name === playerB.name)
  );

  const orphanInventoryIds = new Set();
  for (const player of ejectedPlayersFromB) {
    orphanInventoryIds.add(player.inventoryId);
    orphanInventoryIds.add(player.equipmentId);
  }

  const orphanWorldObjectIds = new Set();
  for (const inventory of (inventoriesB ?? [])) {
    if (orphanInventoryIds.has(inventory.id) && inventory.woIds) {
      for (const woId of inventory.woIds.split(',').map(Number).filter(Boolean)) {
        orphanWorldObjectIds.add(woId);
      }
    }
  }

  return {orphanInventoryIds, orphanWorldObjectIds};
}

function mergeGlobalMetadata([metadataA], [metadataB]) {

  const [validatedMetadataA, validatedMetadataB] = [metadataA, metadataB].map(metadata => {
    return metadata ?? {
      terraTokens: 0,
      allTimeTerraTokens: 0,
      unlockedGroups: '',
      openedInstanceSeed: 0,
      openedInstanceTimeLeft: 0
    };
  });

  const terraTokens = validatedMetadataA.terraTokens + validatedMetadataB.terraTokens;
  const allTimeTerraTokens = validatedMetadataA.allTimeTerraTokens + validatedMetadataB.allTimeTerraTokens;

  const deduplicatedUnlockedGroups = new Set([
    ...validatedMetadataA.unlockedGroups.split(','),
    ...validatedMetadataB.unlockedGroups.split(',')
  ]);
  const unlockedGroups = Array.from(deduplicatedUnlockedGroups).filter(Boolean).join(',');

  const openedInstanceSeed = Math.max(validatedMetadataA.openedInstanceSeed, validatedMetadataB.openedInstanceSeed);
  const openedInstanceTimeLeft = Math.max(validatedMetadataA.openedInstanceTimeLeft, validatedMetadataB.openedInstanceTimeLeft);

  return `{"terraTokens":${terraTokens},"allTimeTerraTokens":${allTimeTerraTokens},"unlockedGroups":"${unlockedGroups}","openedInstanceSeed":${openedInstanceSeed},"openedInstanceTimeLeft":${openedInstanceTimeLeft}}`;
}

function mergeTerraformationLevels(terraformationLevelsA, terraformationLevelsB) {

  const validatedLevelsA = terraformationLevelsA ?? [];
  const validatedLevelsB = terraformationLevelsB ?? [];

  const fullList = [...validatedLevelsA, ...validatedLevelsB];
  const deduplicatedPlanetIds = new Set(fullList.map(level => level.planetId));

  const mergedLevels = Array.from(deduplicatedPlanetIds).map(planetId => {
    const levelA = validatedLevelsA.find(level => level.planetId === planetId);
    const levelB = validatedLevelsB.find(level => level.planetId === planetId);

    if (levelA && levelB) {
      return stringifyEntry({
        planetId,
        unitOxygenLevel: Math.max(levelA.unitOxygenLevel, levelB.unitOxygenLevel),
        unitHeatLevel: Math.max(levelA.unitHeatLevel, levelB.unitHeatLevel),
        unitPressureLevel: Math.max(levelA.unitPressureLevel, levelB.unitPressureLevel),
        unitPlantsLevel: Math.max(levelA.unitPlantsLevel, levelB.unitPlantsLevel),
        unitInsectsLevel: Math.max(levelA.unitInsectsLevel, levelB.unitInsectsLevel),
        unitAnimalsLevel: Math.max(levelA.unitAnimalsLevel, levelB.unitAnimalsLevel),
        unitPurificationLevel: mergePurificationLevel(levelA.unitPurificationLevel, levelB.unitPurificationLevel)
      });
    }

    return stringifyEntry(levelA || levelB);
  });

  return mergedLevels.join('|\n');
}

function mergePlayers(playersA, playersB) {
  const validatedPlayersA = playersA ?? [];
  const validatedPlayersB = playersB ?? [];

  const hostFromSaveA = validatedPlayersA.find(player => player.host);

  const playersFromBNotInA = validatedPlayersB.filter(playerB =>
    !validatedPlayersA.some(playerA => playerA.name === playerB.name)
  );

  const mergedPlayers = [...validatedPlayersA, ...playersFromBNotInA];

  return mergedPlayers.map(player => {
    return stringifyEntry({
      ...player,
      host: player.id === hostFromSaveA?.id,
    });
  }).join('|\n');
}

function mergeWorldObjects(worldObjectsGeneratorA, worldObjectsGeneratorB, orphanWorldObjectIds = new Set()) {
  const mergedWorldObjectsGenerator = createMergedWorldObjectsGenerator(worldObjectsGeneratorA, worldObjectsGeneratorB, orphanWorldObjectIds);
  return serializeWorldObjects(mergedWorldObjectsGenerator);
}

function mergeInventories(inventoriesA, inventoriesB, orphanInventoryIds = new Set()) {
  const validatedInventoriesA = inventoriesA ?? [];
  const validatedInventoriesB = (inventoriesB ?? []).filter(inventory => !orphanInventoryIds.has(inventory.id));

  return [...validatedInventoriesA, ...validatedInventoriesB]
    .map(inventory => JSON.stringify(inventory))
    .join('|\n');
}

function mergeStatistics([statisticsA], [statisticsB]) {
  if (!statisticsA && !statisticsB) {
    return '';
  }

  const defaultStatistics = {
    craftedObjects: 0,
    totalSaveFileLoad: 0,
    totalSaveFileTime: 0
  };
  const validatedStatisticsA = statisticsA ?? defaultStatistics;
  const validatedStatisticsB = statisticsB ?? defaultStatistics;

  return `{"craftedObjects":${validatedStatisticsA.craftedObjects + validatedStatisticsB.craftedObjects},"totalSaveFileLoad":${validatedStatisticsA.totalSaveFileLoad + validatedStatisticsB.totalSaveFileLoad},"totalSaveFileTime":${validatedStatisticsA.totalSaveFileTime + validatedStatisticsB.totalSaveFileTime}}`;
}

function mergeMailboxes(mailboxA, mailboxB) {
  const validatedMailboxA = mailboxA ?? [];
  const validatedMailboxB = mailboxB ?? [];

  const messagesFromBNotInA = validatedMailboxB.filter(messageB =>
    !validatedMailboxA.some(messageA => messageA.stringId === messageB.stringId)
  );

  const deduplicatedMessages = validatedMailboxA.map(messageA => {
    const messageB = validatedMailboxB.find(m => m.stringId === messageA.stringId);
    if (messageB) {
      return {...messageA, isRead: messageA.isRead || messageB.isRead};
    }
    return messageA;
  });

  return [...deduplicatedMessages, ...messagesFromBNotInA]
    .map(message => JSON.stringify(message))
    .join('|\n');
}

function mergeStoryEvents(storyEventsA, storyEventsB) {
  const validatedStoryEventsA = storyEventsA ?? [];
  const validatedStoryEventsB = storyEventsB ?? [];

  const storyEventsFromBNotInA = validatedStoryEventsB.filter(storyEventB =>
    !validatedStoryEventsA.some(storyEventA => storyEventA.stringId === storyEventB.stringId)
  );

  return [...validatedStoryEventsA, ...storyEventsFromBNotInA]
    .map(storyEvent => JSON.stringify(storyEvent))
    .join('|\n');
}

function mergeSaveConfigurations([saveConfigurationA], [saveConfigurationB], saveDisplayName) {
  const saveConfiguration = saveConfigurationA ?? saveConfigurationB;
  if (!saveConfiguration) return '';
  return JSON.stringify({...saveConfiguration, saveDisplayName});
}

function mergeTerrainLayers(terrainLayersA, terrainLayersB) {
  const validatedTerrainLayersA = terrainLayersA ?? [];
  const validatedTerrainLayersB = terrainLayersB ?? [];

  const terrainLayersFromBNotInA = validatedTerrainLayersB.filter(layerB =>
    !validatedTerrainLayersA.some(layerA => layerA.layerId === layerB.layerId && layerA.planet === layerB.planet)
  );

  return [...validatedTerrainLayersA, ...terrainLayersFromBNotInA]
    .map(layer => JSON.stringify(layer))
    .join('|\n');
}

function mergeWorldEvents(worldEventsA, worldEventsB) {
  const validatedWorldEventsA = worldEventsA ?? [];
  const validatedWorldEventsB = worldEventsB ?? [];

  const worldEventsFromBNotInA = validatedWorldEventsB.filter(eventB =>
    !validatedWorldEventsA.some(eventA =>
      eventA.planet === eventB.planet &&
      eventA.seed === eventB.seed &&
      eventA.pos === eventB.pos
    )
  );

  return [...validatedWorldEventsA, ...worldEventsFromBNotInA]
    .map(worldEvent => JSON.stringify(worldEvent))
    .join('|\n');
}

function* createMergedWorldObjectsGenerator(worldObjectsGeneratorA, worldObjectsGeneratorB, orphanWorldObjectIds = new Set()) {
  const positionKeysFromA = new Set();
  for (const worldObject of worldObjectsGeneratorA) {
    if (worldObject.pos) positionKeysFromA.add(buildWorldObjectPositionKey(worldObject));
    yield worldObject;
  }
  for (const worldObject of worldObjectsGeneratorB) {
    if (orphanWorldObjectIds.has(worldObject.id)) continue;
    if (!worldObject.pos || !positionKeysFromA.has(buildWorldObjectPositionKey(worldObject))) {
      yield worldObject;
    }
  }
}

function buildWorldObjectPositionKey(worldObject) {
  return `${worldObject.planet ?? ''}:${worldObject.pos}`;
}

function serializeWorldObjects(worldObjectsGenerator) {
  const parts = [];
  for (const worldObject of worldObjectsGenerator) {
    parts.push(stringifyEntry(worldObject));
  }
  return parts.join('|\n');
}

function mergePurificationLevel(levelA, levelB) {
  const SENTINEL = -1;
  if (levelA === SENTINEL && levelB === SENTINEL) return SENTINEL;
  if (levelA === SENTINEL) return levelB;
  if (levelB === SENTINEL) return levelA;
  return Math.max(levelA, levelB);
}
