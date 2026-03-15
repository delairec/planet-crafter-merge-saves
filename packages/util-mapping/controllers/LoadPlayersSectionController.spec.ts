import {describe, expect, it} from 'bun:test';
import {parseSaveSections} from '../../util-parsing/parseSaveSections.js';
import {createFakeSaveContent} from '../../util-testing/fixtures/createFakeSaveContent';
import {LoadPlayersSectionController} from './LoadPlayersSectionController';
import {PlayersViewModel} from '../presentation/viewModels/PlayersViewModel';

describe('LoadPlayersSectionController', () => {
  it('should present players from parsed save', () => {
    // Arrange
    const sections = parseSaveSections(createFakeSaveContent());

    // Act
    const viewModel = LoadPlayersSectionController.loadPlayersSection(sections);

    // Assert
    expect(viewModel.rows).toEqual<PlayersViewModel['rows']>([{
      cells: [{
        value: 'Nikowa'
      },{
        value: 'Backpack4, OxygenTank5'
      },{
        value: 'Phytoplankton3, MagnetarQuartz'
      }]
    }]);
  });
});

