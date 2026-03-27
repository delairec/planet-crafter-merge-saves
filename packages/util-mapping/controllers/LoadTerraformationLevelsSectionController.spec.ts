import {describe, expect, it} from 'bun:test';
import {parseSaveSections} from '../../util-parsing/parseSaveSections.js';
import {createFakeSaveContent} from '../../util-testing/fixtures/createFakeSaveContent';
import {LoadTerraformationLevelsSectionController} from './LoadTerraformationLevelsSectionController';
import {TerraformationLevelsViewModel} from '../presentation/viewModels/TerraformationLevelsViewModel';

describe('LoadTerraformationLevelsSectionController', () => {
  it('should present terraformation levels from parsed save', () => {
    // Arrange
    const {sections} = parseSaveSections(createFakeSaveContent());

    // Act
    const viewModel = LoadTerraformationLevelsSectionController.loadTerraformationLevelsSection(sections);

    // Assert
    expect(viewModel).toEqual<TerraformationLevelsViewModel>({
      planets: [
        {
          name: 'Toxicity',
          environmentalLevels: {
            columns: [
              {
                header: 'O²',
                values: ['100ppq']
              },
              {
                header: 'Heat',
                values: ['200pK']
              },
              {
                header: 'Pressure',
                values: ['300']
              },
              {
                header: 'Purification',
                values: ['700']
              }
            ]
          },
          organicLevels: {
            columns: [
              {
                header: 'Plants',
                values: ['400']
              },
              {
                header: 'Insects',
                values: ['500']
              },
              {
                header: 'Animals',
                values: ['600']
              },
            ]
          }
        }
      ],
    });
  });
});
