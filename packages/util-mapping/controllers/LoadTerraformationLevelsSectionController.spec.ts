import {describe, expect, it} from 'bun:test';
import {parseSaveSections} from '../../util-parsing/parseSaveSections.js';
import {createFakeSaveContent} from '../../util-testing/fixtures/createFakeSaveContent';
import {LoadTerraformationLevelsSectionController} from './LoadTerraformationLevelsSectionController';
import {TerraformationLevelsViewModel} from '../presentation/viewModels/TerraformationLevelsViewModel';

const nbsp = '\u00A0';

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
                values: [`100${nbsp}ppq`]
              },
              {
                header: 'Heat',
                values: [`200${nbsp}pK`]
              },
              {
                header: 'Pressure',
                values: [`300${nbsp}nPa`]
              },
              {
                header: 'Purification',
                values: [`700${nbsp}Pu`]
              }
            ]
          },
          organicLevels: {
            columns: [
              {
                header: 'Plants',
                values: [`400${nbsp}g`]
              },
              {
                header: 'Insects',
                values: [`500${nbsp}g`]
              },
              {
                header: 'Animals',
                values: [`600${nbsp}g`]
              },
            ]
          },
          terraformationIndex: `2.8${nbsp}kTi`,
          biomass: `1.5${nbsp}kg`
        }
      ],
    });
  });
});
