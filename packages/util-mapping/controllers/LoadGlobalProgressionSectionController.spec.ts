import {describe, expect, it} from 'bun:test';
import {parseSaveSections} from '../../util-parsing/parseSaveSections.js';
import {createFakeSaveContent} from '../../util-testing/fixtures/createFakeSaveContent';
import {LoadGlobalProgressionSectionController} from './LoadGlobalProgressionSectionController';
import {GlobalProgressionViewModel} from '../presentation/viewModels/GlobalProgressionViewModel';

describe('LoadGlobalProgressionSectionController', () => {
  it('should present global progression from parsed save', () => {
    // Arrange
    const {sections} = parseSaveSections(createFakeSaveContent());

    // Act
    const viewModel = LoadGlobalProgressionSectionController.loadGlobalProgressionSection(sections);

    // Assert
    expect(viewModel).toEqual<GlobalProgressionViewModel>({
      headers: ['allTimeTerraTokens'],
      rows: [{
        cells: [{value: '200,345 =tt='}]
      }]
    });
  });
});

