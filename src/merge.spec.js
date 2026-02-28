import {describe, it} from 'node:test';
import {equal} from 'node:assert/strict';
import {mergeSaves, determineSaveOrder} from './merge.js';
import {createFakeSaveString} from './testing/createFakeSaveString.js';

describe('Merge saves', () => {

  const saveA_metadata = {
    terraTokens: 122279,
    allTimeTerraTokens: 222154,
    unlockedGroups: 'MultiToolMineSpeed1,BootsSpeed1,BootsSpeed2,SofaColored',
    openedInstanceSeed: 0,
    openedInstanceTimeLeft: 2
  };

  const saveA_terraformationLevels = [{
    planetId: 'Toxicity',
    unitOxygenLevel: 100.0,
    unitHeatLevel: 200.0,
    unitPressureLevel: 300.0,
    unitPlantsLevel: 400.0,
    unitInsectsLevel: 500.0,
    unitAnimalsLevel: 600.0,
    unitPurificationLevel: 700.0
  }];

  const saveB_metadata = {
    terraTokens: 10928,
    allTimeTerraTokens: 11456,
    unlockedGroups: 'MultiToolMineSpeed1,BootsSpeed1,BedDoubleColored',
    openedInstanceSeed: 1,
    openedInstanceTimeLeft: 0
  };

  const saveB_terraformationLevels = [{
    planetId: 'Prime',
    unitOxygenLevel: 10.0,
    unitHeatLevel: 20.0,
    unitPressureLevel: 30.0,
    unitPlantsLevel: 40.0,
    unitInsectsLevel: 50.0,
    unitAnimalsLevel: 60.0,
    unitPurificationLevel: -1.0
  },
    {
      planetId: 'Aqualis',
      unitOxygenLevel: 1.0,
      unitHeatLevel: 2.0,
      unitPressureLevel: 3.0,
      unitPlantsLevel: 4.0,
      unitInsectsLevel: 5.0,
      unitAnimalsLevel: 6.0,
      unitPurificationLevel: -1.0
    }
  ];

  const mergedSave_metadata = {
    terraTokens: 133207,
    allTimeTerraTokens: 233610,
    unlockedGroups: 'MultiToolMineSpeed1,BootsSpeed1,BootsSpeed2,SofaColored,BedDoubleColored',
    openedInstanceSeed: 1,
    openedInstanceTimeLeft: 2
  };


  const mergedSave_terraformationLevels = [
    ...saveA_terraformationLevels,
    ...saveB_terraformationLevels
  ];

  it('should handle error in case of wrong save format', () => {
    // Act
    const result = mergeSaves('save1', 'save2');

    // Assert
    equal(result, createFakeSaveString({}));
  });

  describe('#1 Global metadata', () => {
    it('should merge metadata', () => {
      // Arrange
      const fakeSaveA = createFakeSaveString({globalMetadata: saveA_metadata});
      const fakeSaveB = createFakeSaveString({globalMetadata: saveB_metadata});

      // Act
      const result = mergeSaves(fakeSaveA, fakeSaveB);

      // Assert
      equal(result, createFakeSaveString({globalMetadata: mergedSave_metadata}));
    });
  });

  describe('#2 Terraformation levels', () => {

    describe('When terraformation levels are unique', () => {
      it('should simply concat terraformation levels', () => {
        // Arrange
        const fakeSaveA = createFakeSaveString({terraformationLevels: saveA_terraformationLevels});
        const fakeSaveB = createFakeSaveString({terraformationLevels: saveB_terraformationLevels});

        // Act
        const result = mergeSaves(fakeSaveA, fakeSaveB);

        // Assert
        equal(result, createFakeSaveString({terraformationLevels: mergedSave_terraformationLevels}));
      });
    });

    describe('When terraformation levels are duplicated', () => {
      it('should merge terraformation levels by taking max values', () => {
        // Arrange
        const fakeSaveA = createFakeSaveString({terraformationLevels: [
            ...saveA_terraformationLevels,
            {
              planetId: 'Prime',
              unitOxygenLevel: 101.0,
              unitHeatLevel: 201.0,
              unitPressureLevel: 301.0,
              unitPlantsLevel: 401.0,
              unitInsectsLevel: 501.0,
              unitAnimalsLevel: 601.0,
              unitPurificationLevel: -1.0
            }
          ]});
        const fakeSaveB = createFakeSaveString({terraformationLevels: saveB_terraformationLevels});

        // Act
        const result = mergeSaves(fakeSaveA, fakeSaveB);

        // Assert
        equal(result, createFakeSaveString({terraformationLevels: [
            {...mergedSave_terraformationLevels[0]},
            {
              planetId: 'Prime',
              unitOxygenLevel: 101.0,
              unitHeatLevel: 201.0,
              unitPressureLevel: 301.0,
              unitPlantsLevel: 401.0,
              unitInsectsLevel: 501.0,
              unitAnimalsLevel: 601.0,
              unitPurificationLevel: -1.0
            },
            {...mergedSave_terraformationLevels[2]}
          ]}));
      });
    });

    describe('When unitPurificationLevel is -1 (sentinel for "not yet unlocked")', () => {
      it('should keep -1 when both saves have -1', () => {
        // Arrange
        const fakeSaveA = createFakeSaveString({terraformationLevels: [{
          planetId: 'Prime', unitOxygenLevel: 10.0, unitHeatLevel: 20.0, unitPressureLevel: 30.0,
          unitPlantsLevel: 40.0, unitInsectsLevel: 50.0, unitAnimalsLevel: 60.0, unitPurificationLevel: -1.0
        }]});
        const fakeSaveB = createFakeSaveString({terraformationLevels: [{
          planetId: 'Prime', unitOxygenLevel: 5.0, unitHeatLevel: 10.0, unitPressureLevel: 15.0,
          unitPlantsLevel: 20.0, unitInsectsLevel: 25.0, unitAnimalsLevel: 30.0, unitPurificationLevel: -1.0
        }]});

        // Act
        const result = mergeSaves(fakeSaveA, fakeSaveB);

        // Assert
        equal(result, createFakeSaveString({terraformationLevels: [{
          planetId: 'Prime', unitOxygenLevel: 10.0, unitHeatLevel: 20.0, unitPressureLevel: 30.0,
          unitPlantsLevel: 40.0, unitInsectsLevel: 50.0, unitAnimalsLevel: 60.0, unitPurificationLevel: -1.0
        }]}));
      });

      it('should take the non-negative value when one save has -1 and the other has a real value', () => {
        // Arrange
        const fakeSaveA = createFakeSaveString({terraformationLevels: [{
          planetId: 'Prime', unitOxygenLevel: 10.0, unitHeatLevel: 20.0, unitPressureLevel: 30.0,
          unitPlantsLevel: 40.0, unitInsectsLevel: 50.0, unitAnimalsLevel: 60.0, unitPurificationLevel: 500.0
        }]});
        const fakeSaveB = createFakeSaveString({terraformationLevels: [{
          planetId: 'Prime', unitOxygenLevel: 5.0, unitHeatLevel: 10.0, unitPressureLevel: 15.0,
          unitPlantsLevel: 20.0, unitInsectsLevel: 25.0, unitAnimalsLevel: 30.0, unitPurificationLevel: -1.0
        }]});

        // Act
        const result = mergeSaves(fakeSaveA, fakeSaveB);

        // Assert
        equal(result, createFakeSaveString({terraformationLevels: [{
          planetId: 'Prime', unitOxygenLevel: 10.0, unitHeatLevel: 20.0, unitPressureLevel: 30.0,
          unitPlantsLevel: 40.0, unitInsectsLevel: 50.0, unitAnimalsLevel: 60.0, unitPurificationLevel: 500.0
        }]}));
      });
    });

    describe('When terraformation level values are integers', () => {
      it('should serialize them with .0 suffix', () => {
        // Arrange
        const level = {planetId: 'Toxicity', unitOxygenLevel: 2477136019456.0, unitHeatLevel: 2219597103104.0, unitPressureLevel: 2262299836416.0, unitPlantsLevel: 918480420864.0, unitInsectsLevel: 372341538816.0, unitAnimalsLevel: 10118330580992.0, unitPurificationLevel: 2653680304128.0};
        const fakeSaveA = createFakeSaveString({terraformationLevels: [level]});
        const fakeSaveB = createFakeSaveString({});

        // Act
        const result = mergeSaves(fakeSaveA, fakeSaveB);

        // Assert
        const terraSection = result.split('@')[1];
        equal(terraSection.includes('"unitOxygenLevel":2477136019456.0'), true);
      });
    });
  });

  describe('#3 Players', () => {
    const saveA_players = [
      {
        id: 76561198155441595,
        name: 'Rrose',
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
      }
    ];

    const saveB_players = [
      {
        id: 76561198055446664,
        name: 'Chillie',
        inventoryId: 3,
        equipmentId: 4,
        playerPosition: '1397.571,465.3293,-397.9421',
        playerRotation: '0,0.5459602,0,0.8378111',
        playerGaugeOxygen: 370.0,
        playerGaugeThirst: 99.90899658203125,
        playerGaugeHealth: 91.76728820800781,
        playerGaugeToxic: 0.0,
        host: false,
        planetId: 'Toxicity'
      }
    ];

    describe('When players are unique', () => {
      it('should concat players from both saves', () => {
        // Arrange
        const fakeSaveA = createFakeSaveString({players: saveA_players});
        const fakeSaveB = createFakeSaveString({players: saveB_players});

        // Act
        const result = mergeSaves(fakeSaveA, fakeSaveB);

        // Assert
        equal(result, createFakeSaveString({players: [...saveA_players, ...saveB_players]}));
      });
    });

    describe('When the same player appears in both saves with a different id', () => {
      it('should deduplicate by name and take the player from save A', () => {
        // Arrange
        const playerInSaveA = {...saveA_players[0], id: 11111, playerGaugeOxygen: 150.0};
        const playerInSaveB = {...saveA_players[0], id: 22222, playerGaugeOxygen: 280.0};
        const fakeSaveA = createFakeSaveString({players: [playerInSaveA]});
        const fakeSaveB = createFakeSaveString({players: [playerInSaveB]});

        // Act
        const result = mergeSaves(fakeSaveA, fakeSaveB);

        // Assert
        equal(result, createFakeSaveString({players: [playerInSaveA]}));
      });
    });

    describe('When a player appears in both saves with the same id', () => {
      it('should take the player from save A', () => {
        // Arrange
        const playerInSaveA = {...saveA_players[0], playerGaugeOxygen: 150.0, inventoryId: 44, equipmentId: 45};
        const playerInSaveB = {...saveA_players[0], playerGaugeOxygen: 280.0, inventoryId: 99, equipmentId: 99};
        const fakeSaveA = createFakeSaveString({players: [playerInSaveA]});
        const fakeSaveB = createFakeSaveString({players: [playerInSaveB]});

        // Act
        const result = mergeSaves(fakeSaveA, fakeSaveB);

        // Assert
        equal(result, createFakeSaveString({players: [playerInSaveA]}));
      });
    });

    describe('When merging host status', () => {
      it('should keep save A host status and set all others to false', () => {
        // Arrange
        const hostInSaveA = {...saveA_players[0], host: true};
        const guestInSaveA = {...saveB_players[0], host: false};
        const hostInSaveB = {...saveB_players[0], host: true};
        const fakeSaveA = createFakeSaveString({players: [hostInSaveA, guestInSaveA]});
        const fakeSaveB = createFakeSaveString({players: [hostInSaveB]});

        // Act
        const result = mergeSaves(fakeSaveA, fakeSaveB);

        // Assert
        equal(result, createFakeSaveString({players: [
            {...hostInSaveA, host: true},
            {...guestInSaveA, host: false}
          ]}));
      });
    });

    describe('When merging planetId', () => {
      it('should preserve each player own planetId', () => {
        // Arrange
        const hostInSaveA = {...saveA_players[0], host: true, planetId: 'Toxicity'};
        const playerInSaveB = {...saveB_players[0], host: false, planetId: 'Prime'};
        const fakeSaveA = createFakeSaveString({players: [hostInSaveA]});
        const fakeSaveB = createFakeSaveString({players: [playerInSaveB]});

        // Act
        const result = mergeSaves(fakeSaveA, fakeSaveB);

        // Assert
        equal(result, createFakeSaveString({players: [
            {...hostInSaveA, planetId: 'Toxicity'},
            {...playerInSaveB, planetId: 'Prime'}
          ]}));
      });
    });
    describe('When player gauges have integer values', () => {
      it('should serialize them with .0 suffix', () => {
        // Arrange
        const player = {...saveA_players[0], playerGaugeOxygen: 280.0, playerGaugeToxic: 0.0};
        const fakeSaveA = createFakeSaveString({players: [player]});
        const fakeSaveB = createFakeSaveString({players: []});

        // Act
        const result = mergeSaves(fakeSaveA, fakeSaveB);

        // Assert
        const playersSection = result.split('@')[2];
        equal(playersSection.includes('"playerGaugeOxygen":280.0'), true);
        equal(playersSection.includes('"playerGaugeToxic":0.0'), true);
      });
    });

  });

  describe('#3 World objects', () => {
    const worldObjectA = {id: 101, gId: 'SomeObject', pos: '100,200,300', rot: '0,0,0,1', planet: 110910047};
    const worldObjectB = {id: 201, gId: 'OtherObject', pos: '400,500,600', rot: '0,0,0,1', planet: 110910047};
    const worldObjectShared = {id: 301, gId: 'SharedObject', pos: '700,800,900', rot: '0,0,0,1', planet: 110910047};

    describe('When world objects are unique', () => {
      it('should concat world objects from both saves', () => {
        // Arrange
        const fakeSaveA = createFakeSaveString({worldObjects: [worldObjectA]});
        const fakeSaveB = createFakeSaveString({worldObjects: [worldObjectB]});

        // Act
        const result = mergeSaves(fakeSaveA, fakeSaveB);

        // Assert
        equal(result, createFakeSaveString({worldObjects: [worldObjectA, worldObjectB]}));
      });
    });

    describe('When a world object appears in both saves with the same pos', () => {
      it('should deduplicate by pos and keep only the one from save A', () => {
        // Arrange
        const worldObjectInSaveA = {...worldObjectShared, id: 301};
        const worldObjectInSaveB = {...worldObjectShared, id: 999};
        const fakeSaveA = createFakeSaveString({worldObjects: [worldObjectInSaveA]});
        const fakeSaveB = createFakeSaveString({worldObjects: [worldObjectInSaveB]});

        // Act
        const result = mergeSaves(fakeSaveA, fakeSaveB);

        // Assert
        equal(result, createFakeSaveString({worldObjects: [worldObjectInSaveA]}));
      });
    });

    describe('When two world objects share the same pos but are on different planets', () => {
      it('should keep both world objects as they are distinct objects', () => {
        // Arrange
        const worldObjectOnPlanetA = {id: 101, gId: 'SomeObject', pos: '100,200,300', rot: '0,0,0,1', planet: 111111111};
        const worldObjectOnPlanetB = {id: 201, gId: 'SomeObject', pos: '100,200,300', rot: '0,0,0,1', planet: 222222222};
        const fakeSaveA = createFakeSaveString({worldObjects: [worldObjectOnPlanetA]});
        const fakeSaveB = createFakeSaveString({worldObjects: [worldObjectOnPlanetB]});

        // Act
        const result = mergeSaves(fakeSaveA, fakeSaveB);

        // Assert
        equal(result, createFakeSaveString({worldObjects: [worldObjectOnPlanetA, worldObjectOnPlanetB]}));
      });
    });

    describe('When a world object has an integer hunger value', () => {
      it('should serialize hunger with .0 suffix', () => {
        // Arrange
        const dnaSequence = {id: 101, gId: 'DNASequence', liId: 1196, grwth: 100, hunger: -100};
        const fakeSaveA = createFakeSaveString({worldObjects: [dnaSequence]});
        const fakeSaveB = createFakeSaveString({});

        // Act
        const result = mergeSaves(fakeSaveA, fakeSaveB);

        // Assert
        const sections = result.split('\n@\n');
        const worldObjectsSection = sections[3];
        equal(worldObjectsSection, '{"id":101,"gId":"DNASequence","liId":1196,"grwth":100,"hunger":-100.0}');
      });
    });
  });

  describe('#4 Inventories', () => {
    const playerA = {
      id: 1,
      name: 'Rrose',
      inventoryId: 44,
      equipmentId: 45,
      playerPosition: '0,0,0',
      playerRotation: '0,0,0,0',
      playerGaugeOxygen: 280.0,
      playerGaugeThirst: 96.0,
      playerGaugeHealth: 72.0,
      playerGaugeToxic: 0.0,
      host: true,
      planetId: 'Toxicity'
    };

    const playerB = {
      id: 2,
      name: 'Chillie',
      inventoryId: 3,
      equipmentId: 4,
      playerPosition: '0,0,0',
      playerRotation: '0,0,0,0',
      playerGaugeOxygen: 370.0,
      playerGaugeThirst: 99.0,
      playerGaugeHealth: 91.0,
      playerGaugeToxic: 0.0,
      host: false,
      planetId: 'Toxicity'
    };

    const inventoryA = {
      id: 44,
      woIds: '204081174,205088187,202802057,202387401,209199668,208890341,209992417,202808348,207565799,203509114,202019416,207117856',
      size: 28
    };
    const inventoryB = {
      id: 3,
      woIds: '206524427,209785873,205093544,207814413,207642135,207043789,203412908,207023582,205081482,201957366,203930732,201357259,208050298,201049268,201852847,205880748,205927490,202986832,209148190',
      size: 20
    };

    describe('When inventories belong to existing players', () => {
      it('should keep all inventories from both saves', () => {
        // Arrange
        const fakeSaveA = createFakeSaveString({players: [playerA], inventories: [inventoryA]});
        const fakeSaveB = createFakeSaveString({players: [playerB], inventories: [inventoryB]});

        // Act
        const result = mergeSaves(fakeSaveA, fakeSaveB);

        // Assert
        equal(result, createFakeSaveString({players: [playerA, playerB], inventories: [inventoryA, inventoryB]}));
      });
    });

    describe('When an inventory has no corresponding player after merge', () => {
      it('should keep the inventory as it may belong to a world object', () => {
        // Arrange
        const worldObjectInventory = {id: 999, woIds: '', size: 5};
        const fakeSaveA = createFakeSaveString({players: [playerA], inventories: [inventoryA, worldObjectInventory]});
        const fakeSaveB = createFakeSaveString({players: [playerB], inventories: [inventoryB]});

        // Act
        const result = mergeSaves(fakeSaveA, fakeSaveB);

        // Assert
        equal(result, createFakeSaveString({players: [playerA, playerB], inventories: [inventoryA, worldObjectInventory, inventoryB]}));
      });

      it('should keep equipment matching equipmentId of existing players', () => {
        // Arrange
        const equipmentA = {id: 45, woIds: '', size: 10};
        const equipmentB = {id: 4, woIds: '', size: 10};
        const fakeSaveA = createFakeSaveString({players: [playerA], inventories: [inventoryA, equipmentA]});
        const fakeSaveB = createFakeSaveString({players: [playerB], inventories: [inventoryB, equipmentB]});

        // Act
        const result = mergeSaves(fakeSaveA, fakeSaveB);

        // Assert
        equal(result, createFakeSaveString({players: [playerA, playerB], inventories: [inventoryA, equipmentA, inventoryB, equipmentB]}));
      });
    });

    describe('When two inventories share the same id', () => {
      it('should keep both inventories as the duplicate id will be resolved later', () => {
        // Arrange
        const inventoryFromB = {id: 44, woIds: '', size: 20};
        const playerBWithSameInventoryId = {...playerB, inventoryId: 44};
        const fakeSaveA = createFakeSaveString({players: [playerA], inventories: [inventoryA]});
        const fakeSaveB = createFakeSaveString({players: [playerBWithSameInventoryId], inventories: [inventoryFromB]});

        // Act
        const result = mergeSaves(fakeSaveA, fakeSaveB);

        // Assert
        equal(result, createFakeSaveString({
          players: [playerA, playerBWithSameInventoryId],
          inventories: [inventoryA, inventoryFromB]
        }));
      });
    });

    describe('When a player from B is ejected because they share a name with a player from A', () => {
      const ejectedPlayerB = {
        id: 99,
        name: 'Rrose',
        inventoryId: 77,
        equipmentId: 78,
        playerPosition: '0,0,0',
        playerRotation: '0,0,0,0',
        playerGaugeOxygen: 100.0,
        playerGaugeThirst: 100.0,
        playerGaugeHealth: 100.0,
        playerGaugeToxic: 0.0,
        host: false,
        planetId: 'Toxicity'
      };
      const orphanInventory = {id: 77, woIds: '901,902', size: 10};
      const orphanEquipment = {id: 78, woIds: '903', size: 5};
      const orphanItem1 = {id: 901, gId: 'Iron'};
      const orphanItem2 = {id: 902, gId: 'Cobalt'};
      const orphanItem3 = {id: 903, gId: 'AirFilter1'};

      it('should drop the orphan inventories of the ejected player', () => {
        // Arrange
        const fakeSaveA = createFakeSaveString({players: [playerA], inventories: [inventoryA]});
        const fakeSaveB = createFakeSaveString({
          players: [ejectedPlayerB, playerB],
          inventories: [orphanInventory, orphanEquipment, inventoryB]
        });

        // Act
        const result = mergeSaves(fakeSaveA, fakeSaveB);

        // Assert
        equal(result, createFakeSaveString({
          players: [playerA, playerB],
          inventories: [inventoryA, inventoryB]
        }));
      });

      it('should drop the world objects that were in the orphan inventories', () => {
        // Arrange
        const fakeSaveA = createFakeSaveString({players: [playerA], inventories: [inventoryA]});
        const fakeSaveB = createFakeSaveString({
          players: [ejectedPlayerB, playerB],
          inventories: [orphanInventory, orphanEquipment, inventoryB],
          worldObjects: [orphanItem1, orphanItem2, orphanItem3]
        });

        // Act
        const result = mergeSaves(fakeSaveA, fakeSaveB);

        // Assert
        equal(result, createFakeSaveString({
          players: [playerA, playerB],
          inventories: [inventoryA, inventoryB],
          worldObjects: []
        }));
      });
    });
  });

  describe('#5 Statistics', () => {
    it('should merge statistics by summing values', () => {
      // Arrange
      const fakeSaveA = createFakeSaveString({statistics: {craftedObjects: 3952, totalSaveFileLoad: 10, totalSaveFileTime: 500}});
      const fakeSaveB = createFakeSaveString({statistics: {craftedObjects: 1000, totalSaveFileLoad: 20, totalSaveFileTime: 300}});

      // Act
      const result = mergeSaves(fakeSaveA, fakeSaveB);

      // Assert
      equal(result, createFakeSaveString({statistics: {craftedObjects: 4952, totalSaveFileLoad: 30, totalSaveFileTime: 800}}));
    });
  });

  describe('#6 Mailboxes', () => {
    const mailboxA = {stringId: 'Message_YouAreAConvict', isRead: true};
    const mailboxB = {stringId: 'Message_toxicity_InfosGoo', isRead: false};
    const mailboxShared = {stringId: 'Message_Shared', isRead: false};

    describe('When mailboxes are unique', () => {
      it('should concat mailboxes from both saves', () => {
        // Arrange
        const fakeSaveA = createFakeSaveString({mailboxes: [mailboxA]});
        const fakeSaveB = createFakeSaveString({mailboxes: [mailboxB]});

        // Act
        const result = mergeSaves(fakeSaveA, fakeSaveB);

        // Assert
        equal(result, createFakeSaveString({mailboxes: [mailboxA, mailboxB]}));
      });
    });

    describe('When a mailbox appears in both saves', () => {
      it('should deduplicate by stringId and prioritize true over false for isRead', () => {
        // Arrange
        const mailboxInSaveA = {...mailboxShared, isRead: false};
        const mailboxInSaveB = {...mailboxShared, isRead: true};
        const fakeSaveA = createFakeSaveString({mailboxes: [mailboxInSaveA]});
        const fakeSaveB = createFakeSaveString({mailboxes: [mailboxInSaveB]});

        // Act
        const result = mergeSaves(fakeSaveA, fakeSaveB);

        // Assert
        equal(result, createFakeSaveString({mailboxes: [{...mailboxShared, isRead: true}]}));
      });

      it('should keep isRead false when both saves have false', () => {
        // Arrange
        const fakeSaveA = createFakeSaveString({mailboxes: [{...mailboxShared, isRead: false}]});
        const fakeSaveB = createFakeSaveString({mailboxes: [{...mailboxShared, isRead: false}]});

        // Act
        const result = mergeSaves(fakeSaveA, fakeSaveB);

        // Assert
        equal(result, createFakeSaveString({mailboxes: [{...mailboxShared, isRead: false}]}));
      });
    });
  });

  describe('#7 Story events', () => {
    const storyEventA = {stringId: 'StoryEvent-FirstMessageClick'};
    const storyEventB = {stringId: 'StoryEvent-Toxicity-InfosGoo'};
    const storyEventShared = {stringId: 'StoryEvent-Shared'};

    describe('When story events are unique', () => {
      it('should concat story events from both saves', () => {
        // Arrange
        const fakeSaveA = createFakeSaveString({storyEvents: [storyEventA]});
        const fakeSaveB = createFakeSaveString({storyEvents: [storyEventB]});

        // Act
        const result = mergeSaves(fakeSaveA, fakeSaveB);

        // Assert
        equal(result, createFakeSaveString({storyEvents: [storyEventA, storyEventB]}));
      });
    });

    describe('When a story event appears in both saves', () => {
      it('should deduplicate by stringId', () => {
        // Arrange
        const fakeSaveA = createFakeSaveString({storyEvents: [storyEventShared]});
        const fakeSaveB = createFakeSaveString({storyEvents: [storyEventShared]});

        // Act
        const result = mergeSaves(fakeSaveA, fakeSaveB);

        // Assert
        equal(result, createFakeSaveString({storyEvents: [storyEventShared]}));
      });
    });
  });

  describe('#8 Save configuration', () => {
    const saveConfigA = {saveDisplayName: 'SaveA', someOtherField: 'valueA'};
    const saveConfigB = {saveDisplayName: 'SaveB', someOtherField: 'valueB'};

    it('should use the saveDisplayName parameter and take save configuration from save A', () => {
      // Arrange
      const fakeSaveA = createFakeSaveString({saveConfiguration: saveConfigA});
      const fakeSaveB = createFakeSaveString({saveConfiguration: saveConfigB});

      // Act
      const result = mergeSaves(fakeSaveA, fakeSaveB, 'MyMergedSave');

      // Assert
      equal(result, createFakeSaveString({saveConfiguration: {...saveConfigA, saveDisplayName: 'MyMergedSave'}}));
    });

    it('should fall back to save B configuration if save A has none', () => {
      // Arrange
      const fakeSaveA = createFakeSaveString({saveConfiguration: null});
      const fakeSaveB = createFakeSaveString({saveConfiguration: saveConfigB});

      // Act
      const result = mergeSaves(fakeSaveA, fakeSaveB, 'MyMergedSave');

      // Assert
      equal(result, createFakeSaveString({saveConfiguration: {...saveConfigB, saveDisplayName: 'MyMergedSave'}}));
    });

    it('should produce an empty configuration if both saves have none', () => {
      // Arrange
      const fakeSaveA = createFakeSaveString({saveConfiguration: null});
      const fakeSaveB = createFakeSaveString({saveConfiguration: null});

      // Act
      const result = mergeSaves(fakeSaveA, fakeSaveB, 'MyMergedSave');

      // Assert
      equal(result, createFakeSaveString({saveConfiguration: null}));
    });
  });

  describe('#9 Terrain layers', () => {
    const terrainLayerA = {layerId: 'PC-Toxicity-Layer2', planet: 110910045, colorBase: '0.69-0.92-0.79-1'};
    const terrainLayerB = {layerId: 'PC-Prime-Layer1', planet: 110910046, colorBase: '0.5-0.5-0.5-1'};
    const terrainLayerShared = {layerId: 'PC-Shared-Layer', planet: 110910047, colorBase: '1-1-1-1'};

    describe('When terrain layers are unique', () => {
      it('should concat terrain layers from both saves', () => {
        // Arrange
        const fakeSaveA = createFakeSaveString({terrainLayers: [terrainLayerA]});
        const fakeSaveB = createFakeSaveString({terrainLayers: [terrainLayerB]});

        // Act
        const result = mergeSaves(fakeSaveA, fakeSaveB);

        // Assert
        equal(result, createFakeSaveString({terrainLayers: [terrainLayerA, terrainLayerB]}));
      });
    });

    describe('When a terrain layer appears in both saves with same layerId and planetId', () => {
      it('should deduplicate and take save A', () => {
        // Arrange
        const layerInSaveA = {...terrainLayerShared, colorBase: '0.1-0.2-0.3-1'};
        const layerInSaveB = {...terrainLayerShared, colorBase: '0.9-0.8-0.7-1'};
        const fakeSaveA = createFakeSaveString({terrainLayers: [layerInSaveA]});
        const fakeSaveB = createFakeSaveString({terrainLayers: [layerInSaveB]});

        // Act
        const result = mergeSaves(fakeSaveA, fakeSaveB);

        // Assert
        equal(result, createFakeSaveString({terrainLayers: [layerInSaveA]}));
      });
    });

    describe('When terrain layers share the same layerId but have different planetId', () => {
      it('should keep both terrain layers', () => {
        // Arrange
        const layerInSaveA = {...terrainLayerShared, planet: 111111111};
        const layerInSaveB = {...terrainLayerShared, planet: 222222222};
        const fakeSaveA = createFakeSaveString({terrainLayers: [layerInSaveA]});
        const fakeSaveB = createFakeSaveString({terrainLayers: [layerInSaveB]});

        // Act
        const result = mergeSaves(fakeSaveA, fakeSaveB);

        // Assert
        equal(result, createFakeSaveString({terrainLayers: [layerInSaveA, layerInSaveB]}));
      });
    });
  });

  describe('#10 World events', () => {
    const worldEventA = {planet: 110910045, seed: 12345, pos: '100,200,300'};
    const worldEventB = {planet: 110910046, seed: 67890, pos: '400,500,600'};
    const worldEventShared = {planet: 110910047, seed: 11111, pos: '700,800,900'};

    describe('When world events are unique', () => {
      it('should concat world events from both saves', () => {
        // Arrange
        const fakeSaveA = createFakeSaveString({worldEvents: [worldEventA]});
        const fakeSaveB = createFakeSaveString({worldEvents: [worldEventB]});

        // Act
        const result = mergeSaves(fakeSaveA, fakeSaveB);

        // Assert
        equal(result, createFakeSaveString({worldEvents: [worldEventA, worldEventB]}));
      });
    });

    describe('When a world event appears in both saves', () => {
      it('should deduplicate by planet, seed and pos and take save A', () => {
        // Arrange
        const fakeSaveA = createFakeSaveString({worldEvents: [worldEventShared]});
        const fakeSaveB = createFakeSaveString({worldEvents: [worldEventShared]});

        // Act
        const result = mergeSaves(fakeSaveA, fakeSaveB);

        // Assert
        equal(result, createFakeSaveString({worldEvents: [worldEventShared]}));
      });
    });

    describe('When world events have additional properties (wrecks)', () => {
      it('should preserve all properties of wreck world events', () => {
        // Arrange
        const wreckEvent = {
          owner: 0, planet: -1140328421, index: 1, seed: 577338550,
          pos: '1250.623,-51.60085,-215.7026', rot: '-0.001,-0.353,-0.010,-0.935',
          wrecksWOGenerated: true, woIdsGenerated: '201234,205678', woIdsDropped: '201234', version: 13
        };
        const fakeSaveA = createFakeSaveString({worldEvents: []});
        const fakeSaveB = createFakeSaveString({worldEvents: [wreckEvent]});

        // Act
        const result = mergeSaves(fakeSaveA, fakeSaveB);

        // Assert
        equal(result, createFakeSaveString({worldEvents: [wreckEvent]}));
      });
    });
  });

  describe('#determineSaveOrder', () => {
    const primeConfig = {saveDisplayName: 'SavePrime', planetId: 'Prime'};
    const toxicityConfig = {saveDisplayName: 'SaveToxicity', planetId: 'Toxicity'};
    const aqualisConfig = {saveDisplayName: 'SaveAqualis', planetId: 'Aqualis'};

    describe('When one save has Prime as planetId and the other does not', () => {
      it('should return the Prime save as save A when it is passed second', () => {
        // Arrange
        const save1 = createFakeSaveString({saveConfiguration: toxicityConfig});
        const save2 = createFakeSaveString({saveConfiguration: primeConfig});

        // Act
        const [resultA, resultB] = determineSaveOrder(save1, save2);

        // Assert
        equal(resultA, save2);
        equal(resultB, save1);
      });

      it('should keep the Prime save as save A when it is already passed first', () => {
        // Arrange
        const save1 = createFakeSaveString({saveConfiguration: primeConfig});
        const save2 = createFakeSaveString({saveConfiguration: toxicityConfig});

        // Act
        const [resultA, resultB] = determineSaveOrder(save1, save2);

        // Assert
        equal(resultA, save1);
        equal(resultB, save2);
      });
    });

    describe('When neither save has Prime as planetId', () => {
      it('should return saves in the original order', () => {
        // Arrange
        const save1 = createFakeSaveString({saveConfiguration: toxicityConfig});
        const save2 = createFakeSaveString({saveConfiguration: aqualisConfig});

        // Act
        const [resultA, resultB] = determineSaveOrder(save1, save2);

        // Assert
        equal(resultA, save1);
        equal(resultB, save2);
      });
    });

    describe('When both saves have Prime as planetId', () => {
      it('should return saves in the original order', () => {
        // Arrange
        const save1 = createFakeSaveString({saveConfiguration: primeConfig});
        const save2 = createFakeSaveString({saveConfiguration: {...primeConfig, saveDisplayName: 'SavePrime2'}});

        // Act
        const [resultA, resultB] = determineSaveOrder(save1, save2);

        // Assert
        equal(resultA, save1);
        equal(resultB, save2);
      });
    });

    describe('When a save has no configuration', () => {
      it('should still promote the Prime save to save A', () => {
        // Arrange
        const save1 = createFakeSaveString({saveConfiguration: null});
        const save2 = createFakeSaveString({saveConfiguration: primeConfig});

        // Act
        const [resultA, resultB] = determineSaveOrder(save1, save2);

        // Assert
        equal(resultA, save2);
        equal(resultB, save1);
      });
    });
  });
});
