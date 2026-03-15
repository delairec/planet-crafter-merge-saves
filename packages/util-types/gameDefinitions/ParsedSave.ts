import {GlobalMetadata} from "./GlobalMetadata";
import {TerraformationLevel} from "./TerraformationLevel";
import {Player} from "./Player";
import {WorldObject} from "./WorldObject";
import {Inventory} from "./Inventory";
import {Statistics} from "./Statistics";
import {MailboxMessage} from "./MailboxMessage";
import {StoryEvent} from "./StoryEvent";
import {SaveConfiguration} from "./SaveConfiguration";
import {TerrainLayer} from "./TerrainLayer";
import {WorldEvent} from "./WorldEvent";

export type ParsedSave = [
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
