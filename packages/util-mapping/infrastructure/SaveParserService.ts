import {
  GLOBAL_METADATA_SECTION_INDEX,
  ParsedSave,
  Player,
  PLAYERS_SECTION_INDEX,
  TERRAFORMATION_LEVELS_SECTION_INDEX,
  TerraformationLevel
} from '../../util-types/gameDefinitions';
import {SaveParserPort} from '../application/ports/SaveParserPort';
import {GlobalProgressionEntity} from "../domain/GlobalProgressionEntity";
import {PlayerEntity} from "../domain/PlayerEntity";
import {TerraformationLevelEntity} from '../domain/TerraformationLevelEntity';

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

  getTerraformationLevels(): TerraformationLevelEntity[] {
    return this.sections[TERRAFORMATION_LEVELS_SECTION_INDEX].map((level: TerraformationLevel): TerraformationLevelEntity => ({
      planetId: level.planetId,
      unitOxygenLevel: level.unitOxygenLevel,
      unitHeatLevel: level.unitHeatLevel,
      unitPressureLevel: level.unitPressureLevel,
      unitPlantsLevel: level.unitPlantsLevel,
      unitInsectsLevel: level.unitInsectsLevel,
      unitAnimalsLevel: level.unitAnimalsLevel,
      unitPurificationLevel: level.unitPurificationLevel
    }));
  }
}
