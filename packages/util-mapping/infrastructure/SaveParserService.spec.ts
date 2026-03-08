import {beforeEach, describe, expect, it} from 'bun:test';
import {createFakeSaveContent, player} from '../../util-testing/fixtures/createFakeSaveContent';
import {parseSaveSections} from '../../util-parsing/parseSaveSections.js';
import {ParsedSave} from '../../util-types/gameDefinitions';
import {PlayerEntity} from "../domain/PlayerEntity";
import {SaveParserService} from './SaveParserService';

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



