import {SaveParserPort} from "../../util-mapping/application/ports/SaveParserPort";
import {GlobalProgressionEntity} from "../../util-mapping/domain/GlobalProgressionEntity";
import {PlayerEntity} from "../../util-mapping/domain/PlayerEntity";
import {TerraformationLevelEntity} from "../../util-mapping/domain/TerraformationLevelEntity";

export class FakeSaveParserService implements SaveParserPort {
  getGlobalMetadata(): GlobalProgressionEntity {
      return {allTimeTerraTokens: 1_234_567};
  }
  getPlayers(): PlayerEntity[] {
    return [{name: 'Nikowa'}, {name: 'Chileny'}];
  }
  getTerraformationLevels(): TerraformationLevelEntity[] {
    return [{
      planetId: "Toxicity",
      unitOxygenLevel: 100,
      unitHeatLevel: 200,
      unitPressureLevel: 300,
      unitPlantsLevel: 400,
      unitInsectsLevel: 500,
      unitAnimalsLevel: 600,
      unitPurificationLevel: 700
    }];
  }
}
