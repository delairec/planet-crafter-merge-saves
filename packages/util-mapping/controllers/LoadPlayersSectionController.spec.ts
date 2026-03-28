import {describe, expect, it} from 'bun:test';
import {parseSaveSections} from '../../util-parsing/parseSaveSections.js';
import {createFakeSaveContent} from '../../util-testing/fixtures/createFakeSaveContent';
import {LoadPlayersSectionController} from './LoadPlayersSectionController';
import {PlayersViewModel} from '../presentation/viewModels/PlayersViewModel';

describe('LoadPlayersSectionController', () => {
  it('should present players from parsed save', () => {
    // Arrange
    const {sections} = parseSaveSections(createFakeSaveContent());

    // Act
    const viewModel = LoadPlayersSectionController.loadPlayersSection(sections);

    // Assert
    expect(viewModel).toEqual<PlayersViewModel>({
      players: [
        {
          name: 'Nikowa',
          columns: [
            {
              header: 'Equipment',
              values: ['Backpack T4', 'Oxygen tank T5']
            },
            {
              header: 'Inventory',
              values: ['Phytoplankton C', 'Magnetar Quartz']
            }
          ]
        }
      ]
    });
  });
});

