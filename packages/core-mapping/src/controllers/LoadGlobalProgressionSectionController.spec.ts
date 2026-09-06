import {describe, expect, it} from 'bun:test';
import {parseSaveSections} from 'shared-save-processing/parseSaveSections.js';
import {createFakeSaveContent} from 'shared-save-processing/testing/createFakeSaveContent.js';
import {LoadGlobalProgressionSectionController} from './LoadGlobalProgressionSectionController.ts';
import type {GlobalProgressionViewModel} from '../presentation/viewModels/GlobalProgressionViewModel.ts';

describe('LoadGlobalProgressionSectionController', () => {
  it('should present global progression from the parsed save', async () => {
    // Arrange
    const {sections} = parseSaveSections(createFakeSaveContent());

    // Act
    const viewModel = await LoadGlobalProgressionSectionController.loadGlobalProgressionSection(sections);

    // Assert
    expect(viewModel).toEqual<GlobalProgressionViewModel>({
      statistics: {
        columns: [
          {
            header: 'All time Terra Tokens',
            values: ['200,345 =tt=']
          },
          {
            header: 'Total crafted objects',
            values: ['10']
          }
        ]
      },
    });
  });
});

