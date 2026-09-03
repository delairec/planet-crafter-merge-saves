import {describe, expect, it, mock} from 'bun:test';
import {MergeSaveFiles} from './MergeSaveFiles';
import {SaveValidatorPort} from './ports/SaveValidatorPort';
import {SaveFilesMergerPort} from './ports/SaveFilesMergerPort';
import {MergeResultPresenterPort} from './ports/MergeResultPresenterPort';

describe('MergeSaveFiles', () => {

  describe('When both saves are valid', () => {
    it('should present a success result with the merged file name and content', () => {
      // Arrange
      const validator: SaveValidatorPort = {validate: mock(() => ({isValid: true, errorMessages: []}))};
      const merger: SaveFilesMergerPort = {merge: mock(() => ({fileName: 'Save-A-Save-B-merged.json', content: 'merged content'}))};
      const presenter: MergeResultPresenterPort = {presentMergeSucceeded: mock(), presentSaveFilesInvalid: mock()};
      const useCase = new MergeSaveFiles(validator, merger, presenter);

      // Act
      useCase.execute('Save-A.json', 'contentA', 'Save-B.json', 'contentB');

      // Assert
      expect(presenter.presentMergeSucceeded).toHaveBeenCalledWith('Save-A-Save-B-merged.json', 'merged content');
    });
  });

  describe('When at least one save is invalid', () => {
    it('should present a validation error result without merging', () => {
      // Arrange
      const validator: SaveValidatorPort = {
        validate: mock((fileName: string, content: string) => content === 'contentA'
          ? {isValid: false, errorMessages: ['Invalid JSON: contentA']}
          : {isValid: true, errorMessages: []})
      };
      const merger: SaveFilesMergerPort = {merge: mock()};
      const presenter: MergeResultPresenterPort = {presentMergeSucceeded: mock(), presentSaveFilesInvalid: mock()};
      const useCase = new MergeSaveFiles(validator, merger, presenter);

      // Act
      useCase.execute('Save-A.json', 'contentA', 'Save-B.json', 'contentB');

      // Assert
      expect(merger.merge).not.toHaveBeenCalled();
      expect(presenter.presentSaveFilesInvalid).toHaveBeenCalledWith(['Invalid JSON: contentA'], []);
    });
  });

  describe('When a save file has an invalid extension', () => {
    it('should present a validation error result reported by the validator', () => {
      // Arrange
      const validator: SaveValidatorPort = {
        validate: mock((fileName: string) => fileName === 'Save-A.txt'
          ? {isValid: false, errorMessages: ['Invalid file extension: expected a .json file.']}
          : {isValid: true, errorMessages: []})
      };
      const merger: SaveFilesMergerPort = {merge: mock()};
      const presenter: MergeResultPresenterPort = {presentMergeSucceeded: mock(), presentSaveFilesInvalid: mock()};
      const useCase = new MergeSaveFiles(validator, merger, presenter);

      // Act
      useCase.execute('Save-A.txt', 'contentA', 'Save-B.json', 'contentB');

      // Assert
      expect(validator.validate).toHaveBeenCalledTimes(2);
      expect(validator.validate).toHaveBeenCalledWith('Save-A.txt', 'contentA');
      expect(validator.validate).toHaveBeenCalledWith('Save-B.json', 'contentB');
      expect(merger.merge).not.toHaveBeenCalled();
      expect(presenter.presentSaveFilesInvalid).toHaveBeenCalledWith(
        ['Invalid file extension: expected a .json file.'],
        []
      );
    });
  });
});
