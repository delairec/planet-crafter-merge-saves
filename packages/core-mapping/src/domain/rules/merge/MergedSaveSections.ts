import {
  GlobalMetadata,
  Inventory,
  MailboxMessage,
  Player,
  SaveConfiguration,
  Statistics,
  StoryEvent,
  TerraformationLevel,
  WorldEvent,
  WorldObject
} from 'shared-save-processing/gameDefinitions';
import {EntriesByOrigin} from './EntriesByOrigin';

/**
 * The ten sections of a save once merged, still structured: serialization happens in
 * infrastructure, after id conflict resolution.
 *
 * Statistics and the save configuration are single-entry sections, absent when neither save
 * carries them.
 */
export interface MergedSaveSections {
  readonly globalMetadata: GlobalMetadata;
  readonly terraformationLevels: readonly TerraformationLevel[];
  readonly players: EntriesByOrigin<Player>;
  readonly worldObjects: EntriesByOrigin<WorldObject>;
  readonly inventories: EntriesByOrigin<Inventory>;
  readonly statistics: Statistics | undefined;
  readonly mailboxes: readonly MailboxMessage[];
  readonly storyEvents: readonly StoryEvent[];
  readonly saveConfiguration: SaveConfiguration | undefined;
  readonly worldEvents: readonly WorldEvent[];
}
