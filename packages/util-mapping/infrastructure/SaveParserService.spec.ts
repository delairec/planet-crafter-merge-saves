import {beforeEach, describe, expect, it} from 'bun:test';
import {createFakeSaveContent, player} from '../../util-testing/fixtures/createFakeSaveContent';
import {parseSaveSections} from '../../util-parsing/parseSaveSections.js';
import {ParsedSave} from '../../util-types/gameDefinitions';
import {PlayerEntity} from "../domain/PlayerEntity";
import {SaveParserService} from './SaveParserService';
import {GlobalProgressionEntity} from "../domain/GlobalProgressionEntity";

describe('SaveParserService', () => {
  let sections: ParsedSave;

  beforeEach(() => {
    sections = parseSaveSections(createFakeSaveContent(
      {
        players: [{
          ...player,
          name: 'Nikowa',
        }, {
          ...player,
          name: 'Chileny',
        }],
      }
    ));
  });

  it('should extract global metadata', () => {
    // Arrange
    const service = new SaveParserService(sections);

    // Act
    const metadata = service.getGlobalMetadata();

    // Assert
    expect(metadata).toEqual<GlobalProgressionEntity>({
      allTimeTerraTokens: 200_345
    });
  });

  it('should extract players section', () => {
    // Arrange
    const service = new SaveParserService(sections);

    // Act
    const players = service.getPlayers();

    // Assert
    expect(players).toEqual<PlayerEntity[]>([{
      name: 'Nikowa',
    },{
      name: 'Chileny',
    }]);
  });
});



