import {describe, expect, it} from 'bun:test';
import {LoadSaveFilePresenter} from './LoadSaveFilePresenter';
import {VALIDATION_ISSUE_CODES} from '../application/ports/ValidationIssue';
import {ParsedSections, WORLD_OBJECTS_SECTION_INDEX} from 'shared-save-processing/gameDefinitions';
import {SaveWarningCode} from 'shared-save-processing/normalizeRawSections.js';
import {LoadSaveFileViewModel} from './viewModels/LoadSaveFileViewModel';
import {SaveValidationMessageViewModel} from './viewModels/SaveFileValidationViewModel';

const parsedSectionCount: ParsedSections['length'] = 11;

const emptySections = Array(parsedSectionCount).fill([]) as ParsedSections;
emptySections[WORLD_OBJECTS_SECTION_INDEX] = function* EMPTY_GENERATOR() {};

const noParsingErrors: string[] = [];
const noWarnings: SaveWarningCode[] = [];

describe('LoadSaveFilePresenter', () => {

  describe('When presenting a loaded save file', () => {
    it('should update the view model with the valid status, the sections and the parsing errors', () => {
      // Arrange
      const presenter = new LoadSaveFilePresenter();

      // Act
      presenter.presentLoadedSaveFile(emptySections, ['Failed to parse world object line: {'], noWarnings);

      // Assert
      expect<LoadSaveFileViewModel>(presenter.viewModel).toEqual({
        status: 'valid',
        sections: emptySections,
        errors: [{message: 'Failed to parse world object line: {', location: null}],
        warnings: []
      });
    });

    it('should translate the warning codes into user messages', () => {
      // Arrange
      const presenter = new LoadSaveFilePresenter();

      // Act
      presenter.presentLoadedSaveFile(emptySections, noParsingErrors, ['legacy-save-format']);

      // Assert
      expect<SaveValidationMessageViewModel[]>(presenter.viewModel.warnings).toEqual([{
        message: 'This save was created by an older version of the game and has been adapted to the current format. The obsolete Terrain Layers section was ignored.',
        location: null
      }]);
    });
  });

  describe('When presenting an invalid save file', () => {
    it('should update the view model with the invalid status and the formatted errors', () => {
      // Arrange
      const presenter = new LoadSaveFilePresenter();

      // Act
      presenter.presentInvalidSaveFile([{code: VALIDATION_ISSUE_CODES.INVALID_EXTENSION, detail: 'Invalid file extension: expected a .json file.'}], noWarnings);

      // Assert
      expect<LoadSaveFileViewModel>(presenter.viewModel).toEqual({
        status: 'invalid',
        sections: null,
        errors: [{message: 'Invalid file extension: expected a .json file.', location: null}],
        warnings: []
      });
    });

    it('should keep the warnings alongside the errors', () => {
      // Arrange
      const presenter = new LoadSaveFilePresenter();

      // Act
      presenter.presentInvalidSaveFile([{code: VALIDATION_ISSUE_CODES.INVALID_JSON, detail: 'Invalid JSON: {'}], ['legacy-save-format']);

      // Assert
      expect<SaveValidationMessageViewModel[]>(presenter.viewModel.warnings).toEqual([{
        message: 'This save was created by an older version of the game and has been adapted to the current format. The obsolete Terrain Layers section was ignored.',
        location: null
      }]);
    });

    it('should tell where in the save each error was found', () => {
      // Arrange
      const presenter = new LoadSaveFilePresenter();

      // Act
      presenter.presentInvalidSaveFile([{code: VALIDATION_ISSUE_CODES.INVALID_JSON, detail: 'Invalid JSON: {', section: 2, entryIndex: 1}], noWarnings);

      // Assert
      expect<SaveValidationMessageViewModel[]>(presenter.viewModel.errors).toEqual([{message: 'Invalid JSON: {', location: 'Players (section 2), entry 1'}]);
    });
  });
});
