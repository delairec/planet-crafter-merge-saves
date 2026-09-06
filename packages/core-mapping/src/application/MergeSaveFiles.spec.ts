import {describe, expect, it, mock} from 'bun:test';
import {MergeSaveFiles} from './MergeSaveFiles';
import {SaveValidatorPort} from './ports/SaveValidatorPort';
import {SaveFilesMergerPort} from './ports/SaveFilesMergerPort';
import {MergeResultPresenterPort} from './ports/MergeResultPresenterPort';
import {VALIDATION_ISSUE_CODES} from './ports/ValidationIssue';

describe('MergeSaveFiles', () => {

  describe('When both saves are valid', () => {
    it('should present a success result with the merged file name and content', async () => {
      // Arrange
      const validator: SaveValidatorPort = {validate: mock(() => ({isValid: true, errors: []}))};
      const merger: SaveFilesMergerPort = {merge: mock(() => ({fileName: 'Save-A-Save-B-merged.json', content: 'merged content'}))};
      const presenter: MergeResultPresenterPort = {presentMergeSucceeded: mock(), presentSaveFilesInvalid: mock()};
      const useCase = new MergeSaveFiles(validator, merger, presenter);

      // Act
      await useCase.execute({fileNameA: 'Save-A.json', contentA: 'contentA', fileNameB: 'Save-B.json', contentB: 'contentB'});

      // Assert
      expect(presenter.presentMergeSucceeded).toHaveBeenCalledWith('Save-A-Save-B-merged.json', 'merged content');
    });
  });

  describe('When at least one save is invalid', () => {
    it('should present a validation error result without merging', async () => {
      // Arrange
      const invalidJsonError = {code: VALIDATION_ISSUE_CODES.INVALID_JSON, detail: 'Invalid JSON: contentA'};
      const validator: SaveValidatorPort = {
        validate: mock((fileName: string, content: string) => content === 'contentA'
          ? {isValid: false, errors: [invalidJsonError]}
          : {isValid: true, errors: []})
      };
      const merger: SaveFilesMergerPort = {merge: mock()};
      const presenter: MergeResultPresenterPort = {presentMergeSucceeded: mock(), presentSaveFilesInvalid: mock()};
      const useCase = new MergeSaveFiles(validator, merger, presenter);

      // Act
      await useCase.execute({fileNameA: 'Save-A.json', contentA: 'contentA', fileNameB: 'Save-B.json', contentB: 'contentB'});

      // Assert
      expect(merger.merge).not.toHaveBeenCalled();
      expect(presenter.presentSaveFilesInvalid).toHaveBeenCalledWith([invalidJsonError], []);
    });
  });

  describe('When a save file has an invalid extension', () => {
    it('should present a validation error result reported by the validator', async () => {
      // Arrange
      const invalidExtensionError = {code: VALIDATION_ISSUE_CODES.INVALID_EXTENSION, detail: 'Invalid file extension: expected a .json file.'};
      const validator: SaveValidatorPort = {
        validate: mock((fileName: string) => fileName === 'Save-A.txt'
          ? {isValid: false, errors: [invalidExtensionError]}
          : {isValid: true, errors: []})
      };
      const merger: SaveFilesMergerPort = {merge: mock()};
      const presenter: MergeResultPresenterPort = {presentMergeSucceeded: mock(), presentSaveFilesInvalid: mock()};
      const useCase = new MergeSaveFiles(validator, merger, presenter);

      // Act
      await useCase.execute({fileNameA: 'Save-A.txt', contentA: 'contentA', fileNameB: 'Save-B.json', contentB: 'contentB'});

      // Assert
      expect(validator.validate).toHaveBeenCalledTimes(2);
      expect(validator.validate).toHaveBeenCalledWith('Save-A.txt', 'contentA');
      expect(validator.validate).toHaveBeenCalledWith('Save-B.json', 'contentB');
      expect(merger.merge).not.toHaveBeenCalled();
      expect(presenter.presentSaveFilesInvalid).toHaveBeenCalledWith([invalidExtensionError], []);
    });
  });
});
