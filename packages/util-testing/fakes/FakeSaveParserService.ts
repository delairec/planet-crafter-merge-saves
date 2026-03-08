import {SaveParserPort} from "../../util-mapping/application/ports/SaveParserPort";
import {PlayerEntity} from "../../util-mapping/domain/PlayerEntity";

export class FakeSaveParserService implements SaveParserPort {
  getPlayers(): PlayerEntity[] {
    return [{name: 'Nikowa'}, {name: 'Chileny'}];
  }
}
