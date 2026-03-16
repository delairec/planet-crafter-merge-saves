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

export type ParsedSave = {
  sections: ParsedSections;
  errors: string[];
};
