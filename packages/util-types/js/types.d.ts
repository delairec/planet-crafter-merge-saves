// Auto-generated ambient type declarations to satisfy JSDoc/type-checking in JS files

export {};

declare global {
  interface RuntimePlatform {
    readTextFile: (path: string) => Promise<string>;
    writeTextFile: (path: string, content: string) => Promise<void>;
    readDirectory: (path: string) => Promise<string[]>;
    joinPath: (...segments: string[]) => string;
    getBasename: (path: string, extension?: string) => string;
    exitProcess: (code: number) => never;
    getCliArguments: () => string[];
    isEntryPoint: (importMeta: { main?: boolean }) => boolean;
  }

  interface GlobalMetadata {
    terraTokens: number;
    allTimeTerraTokens: number;
    unlockedGroups: string;
    openedInstanceSeed: number;
    openedInstanceTimeLeft: number;
  }

  interface TerraformationLevel {
    planetId: string;
    unitOxygenLevel: number;
    unitHeatLevel: number;
    unitPressureLevel: number;
    unitPlantsLevel: number;
    unitInsectsLevel: number;
    unitAnimalsLevel: number;
    unitPurificationLevel: number;
  }

  interface Player {
    id: number;
    name: string;
    inventoryId: number;
    equipmentId: number;
    playerPosition: string;
    playerRotation: string;
    playerGaugeOxygen: number;
    playerGaugeThirst: number;
    playerGaugeHealth: number;
    playerGaugeToxic: number;
    host: boolean;
    planetId: string;
  }

  interface WorldObject {
    id: number;
    gId: string;
    pos?: string;
    rot?: string;
    planet?: number;
    liId?: number;
    woIds?: string;
    hunger?: number;
    grwth?: number;
    count?: string;
    text?: string;
  }

  interface Inventory {
    id: number;
    woIds: string;
    size: number;
    demandGrps?: string;
    supplyGrps?: string;
    priority?: number;
  }

  interface Statistics {
    craftedObjects: number;
    totalSaveFileLoad: number;
    totalSaveFileTime: number;
  }

  interface MailboxMessage {
    stringId: string;
    isRead: boolean;
  }

  interface StoryEvent {
    stringId: string;
  }

  interface SaveConfiguration {
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
  }

  interface TerrainLayer {
    layerId: string;
    planet: number;
    colorBase: string;
  }

  interface WorldEvent {
    planet: number;
    seed: number;
    pos: string;
    owner?: number;
    index?: number;
    rot?: string;
    wrecksWOGenerated?: boolean;
    woIdsGenerated?: string;
    woIdsDropped?: string;
    version?: number;
  }

  type ParsedSections = [
    GlobalMetadata[],
    TerraformationLevel[],
    Player[],
    () => Generator<WorldObject>,
    Inventory[],
    Statistics[],
    MailboxMessage[],
    StoryEvent[],
    SaveConfiguration[],
    TerrainLayer[],
    WorldEvent[],
    never[]
  ];

  type ParsedSave = {
    sections: ParsedSections;
    errors: string[];
  };
}

export interface GlobalMetadata {
  terraTokens: number;
  allTimeTerraTokens: number;
  unlockedGroups: string;
  openedInstanceSeed: number;
  openedInstanceTimeLeft: number;
}

export interface TerraformationLevel {
  planetId: string;
  unitOxygenLevel: number;
  unitHeatLevel: number;
  unitPressureLevel: number;
  unitPlantsLevel: number;
  unitInsectsLevel: number;
  unitAnimalsLevel: number;
  unitPurificationLevel: number;
}

export interface Player {
  id: number;
  name: string;
  inventoryId: number;
  equipmentId: number;
  playerPosition: string;
  playerRotation: string;
  playerGaugeOxygen: number;
  playerGaugeThirst: number;
  playerGaugeHealth: number;
  playerGaugeToxic: number;
  host: boolean;
  planetId: string;
}

export interface WorldObject {
  id: number;
  gId: string;
  pos?: string;
  rot?: string;
  planet?: number;
  liId?: number;
  woIds?: string;
  hunger?: number;
  grwth?: number;
  count?: string;
  text?: string;
}

export interface Inventory {
  id: number;
  woIds: string;
  size: number;
  demandGrps?: string;
  supplyGrps?: string;
  priority?: number;
}

export interface Statistics {
  craftedObjects: number;
  totalSaveFileLoad: number;
  totalSaveFileTime: number;
}

export interface MailboxMessage {
  stringId: string;
  isRead: boolean;
}

export interface StoryEvent {
  stringId: string;
}

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
}

export interface TerrainLayer {
  layerId: string;
  planet: number;
  colorBase: string;
}

export interface WorldEvent {
  planet: number;
  seed: number;
  pos: string;
  owner?: number;
  index?: number;
  rot?: string;
  wrecksWOGenerated?: boolean;
  woIdsGenerated?: string;
  woIdsDropped?: string;
  version?: number;
}

export type ParsedSections = [
  GlobalMetadata[],
  TerraformationLevel[],
  Player[],
  () => Generator<WorldObject>,
  Inventory[],
  Statistics[],
  MailboxMessage[],
  StoryEvent[],
  SaveConfiguration[],
  TerrainLayer[],
  WorldEvent[],
  never[]
];

export type ParsedSave = {
  sections: ParsedSections;
  errors: string[];
};
