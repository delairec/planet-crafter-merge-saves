import {describe, expect, it} from 'bun:test';
import {LoadSaveFilePresenter} from './LoadSaveFilePresenter';
import {VALIDATION_ISSUE_CODES} from '../application/ports/ValidationIssue';
import {ParsedSections} from 'shared-save-processing/gameDefinitions';

const saveSectionCount = 11;
const worldObjectsSectionIndex = 3;

const emptySections = Array(saveSectionCount).fill([]) as ParsedSections;
emptySections[worldObjectsSectionIndex] = function* () {};

describe('LoadSaveFilePresenter', () => {

  describe('When presenting a loaded save file', () => {
    it('should update the view model with the valid status, the sections and the parsing errors', () => {
      // Arrange
      const presenter = new LoadSaveFilePresenter();

      // Act
      presenter.presentLoadedSaveFile(emptySections, ['Failed to parse world object line: {'], []);

      // Assert
      expect(presenter.viewModel).toEqual({
        status: 'valid',
        sections: emptySections,
        errorMessages: ['Failed to parse world object line: {'],
        warnings: []
      });
    });

    it('should translate the warning codes into user messages', () => {
      // Arrange
      const presenter = new LoadSaveFilePresenter();

      // Act
      presenter.presentLoadedSaveFile(emptySections, [], ['legacy-save-format']);

      // Assert
      expect(presenter.viewModel.warnings).toEqual(['This save was created by an older version of the game and has been adapted to the current format. The obsolete Terrain Layers section was ignored.']);
    });
  });

  describe('When presenting an invalid save file', () => {
    it('should update the view model with the invalid status and the formatted error messages', () => {
      // Arrange
      const presenter = new LoadSaveFilePresenter();

      // Act
      presenter.presentInvalidSaveFile([{code: VALIDATION_ISSUE_CODES.INVALID_EXTENSION, detail: 'Invalid file extension: expected a .json file.'}], []);

      // Assert
      expect(presenter.viewModel).toEqual({
        status: 'invalid',
        sections: null,
        errorMessages: ['Invalid file extension: expected a .json file.'],
        warnings: []
      });
    });

    it('should keep the warning messages alongside the errors', () => {
      // Arrange
      const presenter = new LoadSaveFilePresenter();

      // Act
      presenter.presentInvalidSaveFile([{code: VALIDATION_ISSUE_CODES.INVALID_JSON, detail: 'Invalid JSON: {'}], ['legacy-save-format']);

      // Assert
      expect(presenter.viewModel.warnings).toEqual(['This save was created by an older version of the game and has been adapted to the current format. The obsolete Terrain Layers section was ignored.']);
    });
  });
});
