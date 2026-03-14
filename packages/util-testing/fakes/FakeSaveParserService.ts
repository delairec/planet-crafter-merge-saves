import {SaveParserPort} from "../../util-mapping/application/ports/SaveParserPort";
import {GlobalProgressionEntity} from "../../util-mapping/domain/GlobalProgressionEntity";
import {PlayerEntity} from "../../util-mapping/domain/PlayerEntity";

export class FakeSaveParserService implements SaveParserPort {
  getGlobalMetadata(): GlobalProgressionEntity {
      return {allTimeTerraTokens: 1_234_567};
  }
  getPlayers(): PlayerEntity[] {
    return [{name: 'Nikowa'}, {name: 'Chileny'}];
  }
}
