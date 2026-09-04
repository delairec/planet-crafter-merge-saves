import {describe, expect, it, mock} from 'bun:test';
import {LoadAndValidateSaveFile} from './LoadAndValidateSaveFile';
import {SaveValidatorPort} from './ports/SaveValidatorPort';
import {SaveSectionsParserPort} from './ports/SaveSectionsParserPort';
import {LoadAndValidateSaveFilePresenterPort} from './ports/LoadAndValidateSaveFilePresenterPort';
import {VALIDATION_ISSUE_CODES} from './ports/ValidationIssue';

describe('LoadAndValidateSaveFile', () => {

  describe('When the save file is invalid', () => {
    it('should present an invalid save file with the validation errors and never parse the content', async () => {
      // Arrange
      const errors = [{code: VALIDATION_ISSUE_CODES.INVALID_EXTENSION, detail: 'Invalid file extension: expected a .json file.'}];
      const validator: SaveValidatorPort = {validate: mock(() => ({isValid: false, errors}))};
      const parser: SaveSectionsParserPort = {parse: mock()};
      const presenter: LoadAndValidateSaveFilePresenterPort = {presentInvalidSaveFile: mock(), presentLoadedSaveFile: mock()};
      const useCase = new LoadAndValidateSaveFile(validator, parser, presenter);

      // Act
      await useCase.execute({fileName: 'Save-A.txt', content: 'content'});

      // Assert
      expect(presenter.presentInvalidSaveFile).toHaveBeenCalledWith(errors);
      expect(presenter.presentLoadedSaveFile).not.toHaveBeenCalled();
      expect(parser.parse).not.toHaveBeenCalled();
    });
  });

  describe('When the save file is valid', () => {
    it('should parse the content and present the loaded save file', async () => {
      // Arrange
      const sections = [] as never;
      const validator: SaveValidatorPort = {validate: mock(() => ({isValid: true, errors: []}))};
      const parser: SaveSectionsParserPort = {parse: mock(() => ({sections, errors: ['parse error'], warnings: ['parse warning']}))};
      const presenter: LoadAndValidateSaveFilePresenterPort = {presentInvalidSaveFile: mock(), presentLoadedSaveFile: mock()};
      const useCase = new LoadAndValidateSaveFile(validator, parser, presenter);

      // Act
      await useCase.execute({fileName: 'Save-A.json', content: 'content'});

      // Assert
      expect(parser.parse).toHaveBeenCalledWith('content');
      expect(presenter.presentLoadedSaveFile).toHaveBeenCalledWith(sections, ['parse error'], ['parse warning']);
      expect(presenter.presentInvalidSaveFile).not.toHaveBeenCalled();
    });
  });
});
