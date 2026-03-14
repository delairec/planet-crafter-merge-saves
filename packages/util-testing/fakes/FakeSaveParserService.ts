import {SaveParserPort} from "../../util-mapping/application/ports/SaveParserPort";
import {GlobalProgressionValueObject} from "../../util-mapping/domain/valueObjects/GlobalProgressionValueObject";
import {PlayerEntity} from "../../util-mapping/domain/entities/PlayerEntity";
import {TerraformationLevelEntity} from "../../util-mapping/domain/entities/TerraformationLevelEntity";

export class FakeSaveParserService implements SaveParserPort {
  getGlobalMetadata(): GlobalProgressionValueObject {
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
