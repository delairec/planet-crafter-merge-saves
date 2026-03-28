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
                values: ['100 ppq']
              },
              {
                header: 'Heat',
                values: ['200 pK']
              },
              {
                header: 'Pressure',
                values: ['300 nPa']
              },
              {
                header: 'Purification',
                values: ['700 Pu']
              }
            ]
          },
          organicLevels: {
            columns: [
              {
                header: 'Plants',
                values: ['400 g']
              },
              {
                header: 'Insects',
                values: ['500 g']
              },
              {
                header: 'Animals',
                values: ['600 g']
              },
            ]
          },
          terraformationIndex: '2.8 kTi',
          biomass: '1.5 kg'
        }
      ],
    });
  });
});
