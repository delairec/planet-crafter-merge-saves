import {describe, expect, it} from 'bun:test';
import {MergeResultPresenter} from './MergeResultPresenter';
import {ValidationIssue, VALIDATION_ISSUE_CODES} from '../application/ports/ValidationIssue';
import {SaveWarningCode} from 'shared-save-processing/normalizeRawSections.js';
import {MergeResultViewModel} from './viewModels/MergeResultViewModel';
import {SaveValidationMessageViewModel} from './viewModels/SaveFileValidationViewModel';

const noErrorsFromSaveB: ValidationIssue[] = [];
const noWarningsFromSaveA: SaveWarningCode[] = [];
const noWarningsFromSaveB: SaveWarningCode[] = [];

describe('MergeResultPresenter', () => {

  describe('When presenting a merge success', () => {
    it('should update the view model with the success status, file name and content', () => {
      // Arrange
      const presenter = new MergeResultPresenter();

      // Act
      presenter.presentMergeSucceeded('merged.json', 'merged content', noWarningsFromSaveA, noWarningsFromSaveB);

      // Assert
      expect<MergeResultViewModel>(presenter.viewModel).toEqual({
        status: 'success',
        fileName: 'merged.json',
        content: 'merged content',
        saveAErrors: [],
        saveBErrors: [],
        saveAWarnings: [],
        saveBWarnings: []
      });
    });

    it('should translate the warning codes of each merged save into user messages', () => {
      // Arrange
      const presenter = new MergeResultPresenter();

      // Act
      presenter.presentMergeSucceeded('merged.json', 'merged content', ['legacy-save-format'], noWarningsFromSaveB);

      // Assert
      expect<SaveValidationMessageViewModel[]>(presenter.viewModel.saveAWarnings).toEqual([{
        message: 'This save was created by an older version of the game and has been adapted to the current format. The obsolete Terrain Layers section was ignored.',
        location: null
      }]);
      expect<SaveValidationMessageViewModel[]>(presenter.viewModel.saveBWarnings).toEqual([]);
    });
  });

  describe('When presenting invalid save files', () => {
    it('should update the view model with the validation error status and each save errors', () => {
      // Arrange
      const presenter = new MergeResultPresenter();

      // Act
      presenter.presentSaveFilesInvalid(
        [{code: VALIDATION_ISSUE_CODES.INVALID_JSON, detail: 'Invalid JSON: contentA'}],
        noErrorsFromSaveB,
        noWarningsFromSaveA,
        noWarningsFromSaveB
      );

      // Assert
      expect<MergeResultViewModel>(presenter.viewModel).toEqual({
        status: 'validationError',
        fileName: '',
        content: '',
        saveAErrors: [{message: 'Invalid JSON: contentA', location: null}],
        saveBErrors: [],
        saveAWarnings: [],
        saveBWarnings: []
      });
    });

    it('should keep the warnings alongside the errors', () => {
      // Arrange
      const presenter = new MergeResultPresenter();

      // Act
      presenter.presentSaveFilesInvalid(
        [{code: VALIDATION_ISSUE_CODES.INVALID_JSON, detail: 'Invalid JSON: contentA'}],
        noErrorsFromSaveB,
        noWarningsFromSaveA,
        ['legacy-save-format']
      );

      // Assert
      expect<SaveValidationMessageViewModel[]>(presenter.viewModel.saveBWarnings).toEqual([{
        message: 'This save was created by an older version of the game and has been adapted to the current format. The obsolete Terrain Layers section was ignored.',
        location: null
      }]);
    });

    it('should tell where in each save the errors were found', () => {
      // Arrange
      const presenter = new MergeResultPresenter();

      // Act
      presenter.presentSaveFilesInvalid(
        [{code: VALIDATION_ISSUE_CODES.INVALID_JSON, detail: 'Invalid JSON: { broken', section: 2, entryIndex: 1}],
        [{code: VALIDATION_ISSUE_CODES.SCHEMA_VIOLATION, detail: 'must have required property gId', section: 4, entryIndex: 0}],
        noWarningsFromSaveA,
        noWarningsFromSaveB
      );

      // Assert
      expect<SaveValidationMessageViewModel[]>(presenter.viewModel.saveAErrors).toEqual([{message: 'Invalid JSON: { broken', location: 'Players (section 2), entry 1'}]);
      expect<SaveValidationMessageViewModel[]>(presenter.viewModel.saveBErrors).toEqual([{message: 'must have required property gId', location: 'Inventories (section 4), entry 0'}]);
    });
  });
});
