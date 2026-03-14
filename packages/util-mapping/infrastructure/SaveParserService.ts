import {GLOBAL_METADATA_SECTION_INDEX, ParsedSave, Player, PLAYERS_SECTION_INDEX} from '../../util-types/gameDefinitions';
import {SaveParserPort} from '../application/ports/SaveParserPort';
import {GlobalProgressionEntity} from "../domain/GlobalProgressionEntity";
import {PlayerEntity} from "../domain/PlayerEntity";

export class SaveParserService implements SaveParserPort {
  constructor(private readonly sections: ParsedSave) {
  }

  getGlobalMetadata(): GlobalProgressionEntity {
    const metadata = this.sections[GLOBAL_METADATA_SECTION_INDEX][0];
    return {
      allTimeTerraTokens: metadata.allTimeTerraTokens
    }
  }

  getPlayers(): PlayerEntity[] {
    return this.sections[PLAYERS_SECTION_INDEX].map((player: Player): PlayerEntity => ({
      name: player.name,
    }));
  }
}




