import {describe, expect, it} from 'bun:test';
import {parseSaveSections} from 'shared-save-processing/parseSaveSections.js';
import {createFakeSaveContent} from 'shared-save-processing/testing/createFakeSaveContent.js';
import {LoadPlayersSectionController} from './LoadPlayersSectionController';
import {PlayersViewModel} from '../presentation/viewModels/PlayersViewModel';

describe('LoadPlayersSectionController', () => {
  it('should present players from the parsed save', async () => {
    // Arrange
    const {sections} = parseSaveSections(createFakeSaveContent());

    // Act
    const viewModel = await LoadPlayersSectionController.loadPlayersSection(sections);

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

