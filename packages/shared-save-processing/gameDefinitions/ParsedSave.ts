import type {GlobalMetadata} from "./GlobalMetadata.ts";
import type {TerraformationLevel} from "./TerraformationLevel.ts";
import type {Player} from "./Player.ts";
import type {WorldObject} from "./WorldObject.ts";
import type {Inventory} from "./Inventory.ts";
import type {Statistics} from "./Statistics.ts";
import type {MailboxMessage} from "./MailboxMessage.ts";
import type {StoryEvent} from "./StoryEvent.ts";
import type {SaveConfiguration} from "./SaveConfiguration.ts";
import type {WorldEvent} from "./WorldEvent.ts";
import type {SaveWarningCode} from "../normalizeRawSections.js";

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
  WorldEvent[],
  never[]
];

export type ParsedSave = {
  sections: ParsedSections;
  errors: string[];
  warnings: SaveWarningCode[];
};
