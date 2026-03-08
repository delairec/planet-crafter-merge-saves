import {describe, expect, it} from 'bun:test';
import {createFakeSaveContent} from '../../util-testing/fixtures/createFakeSaveContent';
import {LoadSaveDataController} from './LoadSaveDataController';
import {PlayersViewModel} from '../presentation/viewModels/PlayersViewModel';

describe('LoadSaveDataController', () => {
  it('should present players from parsed save', () => {
    // Arrange
    const saveString = createFakeSaveContent();

    // Act
    const viewModel = LoadSaveDataController.loadSaveData(saveString);

    // Assert
    expect(viewModel).toEqual<PlayersViewModel>({ players: [{ name: 'Nikowa' }] });
  });
});

