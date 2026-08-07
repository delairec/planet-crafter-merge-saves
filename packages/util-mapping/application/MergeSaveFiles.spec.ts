import {describe, it, expect, mock} from 'bun:test';
import {MergeSaveFiles} from './MergeSaveFiles';
import {SaveValidatorPort} from './ports/SaveValidatorPort';
import {SaveMergerPort} from './ports/SaveMergerPort';
import {MergeResultPresenterPort} from './ports/MergeResultPresenterPort';

describe('MergeSaveFiles', () => {

  describe('When both saves are valid', () => {
    it('should present a success result with the merged file name and content', () => {
      // Arrange
      const validator: SaveValidatorPort = {validate: mock(() => ({isValid: true, errorMessages: []}))};
      const merger: SaveMergerPort = {merge: mock(() => ({fileName: 'Save-A-Save-B-merged.json', content: 'merged content'}))};
      const presenter: MergeResultPresenterPort = {present: mock()};
      const useCase = new MergeSaveFiles(validator, merger, presenter);

      // Act
      useCase.execute('Save-A.json', 'contentA', 'Save-B.json', 'contentB');

      // Assert
      expect(presenter.present).toHaveBeenCalledWith({
        status: 'success',
        fileName: 'Save-A-Save-B-merged.json',
        content: 'merged content'
      });
    });
  });

  describe('When at least one save is invalid', () => {
    it('should present a validation error result without merging', () => {
      // Arrange
      const validator: SaveValidatorPort = {
        validate: mock((content: string) => content === 'contentA'
          ? {isValid: false, errorMessages: ['Invalid JSON: contentA']}
          : {isValid: true, errorMessages: []})
      };
      const merger: SaveMergerPort = {merge: mock()};
      const presenter: MergeResultPresenterPort = {present: mock()};
      const useCase = new MergeSaveFiles(validator, merger, presenter);

      // Act
      useCase.execute('Save-A.json', 'contentA', 'Save-B.json', 'contentB');

      // Assert
      expect(merger.merge).not.toHaveBeenCalled();
      expect(presenter.present).toHaveBeenCalledWith({
        status: 'validationError',
        saveAErrorMessages: ['Invalid JSON: contentA'],
        saveBErrorMessages: []
      });
    });
  });

  describe('When a save file has an invalid extension', () => {
    it('should present a validation error result without validating its content', () => {
      // Arrange
      const validator: SaveValidatorPort = {validate: mock(() => ({isValid: true, errorMessages: []}))};
      const merger: SaveMergerPort = {merge: mock()};
      const presenter: MergeResultPresenterPort = {present: mock()};
      const useCase = new MergeSaveFiles(validator, merger, presenter);

      // Act
      useCase.execute('Save-A.txt', 'contentA', 'Save-B.json', 'contentB');

      // Assert
      expect(validator.validate).toHaveBeenCalledTimes(1);
      expect(validator.validate).toHaveBeenCalledWith('contentB');
      expect(merger.merge).not.toHaveBeenCalled();
      expect(presenter.present).toHaveBeenCalledWith({
        status: 'validationError',
        saveAErrorMessages: ['Invalid file extension: expected a .json file.'],
        saveBErrorMessages: []
      });
    });
  });
});
