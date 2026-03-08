import {ParsedSave, Player, PLAYERS_SECTION_INDEX} from '../../util-types/gameDefinitions';
import {SaveParserPort} from '../application/ports/SaveParserPort';
import {PlayerEntity} from "../domain/PlayerEntity";

export class SaveParserService implements SaveParserPort {
  constructor(private readonly sections: ParsedSave) {}

  getPlayers(): PlayerEntity[] {
    return this.sections[PLAYERS_SECTION_INDEX].map((player: Player): PlayerEntity => ({
      name: player.name,
    }));
  }
}




