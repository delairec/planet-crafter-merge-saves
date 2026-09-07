import {describe, expect, it, mock} from 'bun:test';
import {LoadAndValidateSaveFile} from './LoadAndValidateSaveFile';
import {SaveValidatorPort} from './ports/SaveValidatorPort';
import {ParsedSaveSections, SaveSectionsParserPort} from './ports/SaveSectionsParserPort';
import {LoadAndValidateSaveFilePresenterPort} from './ports/LoadAndValidateSaveFilePresenterPort';
import {ValidationIssue, VALIDATION_ISSUE_CODES} from './ports/ValidationIssue';
import {SaveWarningCode} from 'shared-save-processing/normalizeRawSections.js';
import {ParsedSections} from 'shared-save-processing/gameDefinitions';

const emptySections: ParsedSections = [[], [], [], function* () {}, [], [], [], [], [], [], []];

interface UseCaseOverrides {
  validationErrors?: ValidationIssue[];
  validationWarnings?: SaveWarningCode[];
  parsedSaveSections?: ParsedSaveSections;
}

function setupUseCase({
                        validationErrors = [],
                        validationWarnings = [],
                        parsedSaveSections = {sections: emptySections, errors: []}
                      }: UseCaseOverrides = {}) {
  const validator: SaveValidatorPort = {
    validate: mock(() => ({isValid: validationErrors.length === 0, errors: validationErrors, warnings: validationWarnings}))
  };
  const parser: SaveSectionsParserPort = {parse: mock(() => parsedSaveSections)};
  const presenter: LoadAndValidateSaveFilePresenterPort = {presentInvalidSaveFile: mock(), presentLoadedSaveFile: mock()};

  return {useCase: new LoadAndValidateSaveFile(validator, parser, presenter), validator, parser, presenter};
}

describe('LoadAndValidateSaveFile', () => {

  describe('When the save file is invalid', () => {
    it('should present an invalid save file with the validation errors and never parse the content', async () => {
      // Arrange
      const validationErrors = [{code: VALIDATION_ISSUE_CODES.INVALID_EXTENSION, detail: 'Invalid file extension: expected a .json file.'}];
      const {useCase, parser, presenter} = setupUseCase({validationErrors});

      // Act
      await useCase.execute({fileName: 'Save-A.txt', content: 'content'});

      // Assert
      expect(presenter.presentInvalidSaveFile).toHaveBeenCalledWith(validationErrors, []);
      expect(presenter.presentLoadedSaveFile).not.toHaveBeenCalled();
      expect(parser.parse).not.toHaveBeenCalled();
    });
  });

  describe('When the save file is valid', () => {
    it('should parse the content and present the loaded save file', async () => {
      // Arrange
      const {useCase, parser, presenter} = setupUseCase({
        parsedSaveSections: {sections: emptySections, errors: ['parse error']}
      });

      // Act
      await useCase.execute({fileName: 'Save-A.json', content: 'content'});

      // Assert
      expect(parser.parse).toHaveBeenCalledWith('content');
      expect(presenter.presentLoadedSaveFile).toHaveBeenCalledWith(emptySections, ['parse error'], []);
      expect(presenter.presentInvalidSaveFile).not.toHaveBeenCalled();
    });
  });

  describe('When validation reports that the save had to be adapted', () => {
    it('should present the warnings of a loaded save file', async () => {
      // Arrange
      const {useCase, presenter} = setupUseCase({validationWarnings: ['legacy-save-format']});

      // Act
      await useCase.execute({fileName: 'Save-A.json', content: 'content'});

      // Assert
      expect(presenter.presentLoadedSaveFile).toHaveBeenCalledWith(emptySections, [], ['legacy-save-format']);
    });

    it('should present the warnings of an invalid save file too', async () => {
      // Arrange
      const validationErrors = [{code: VALIDATION_ISSUE_CODES.INVALID_JSON, detail: 'Invalid JSON: {'}];
      const {useCase, presenter} = setupUseCase({validationErrors, validationWarnings: ['legacy-save-format']});

      // Act
      await useCase.execute({fileName: 'Save-A.json', content: 'content'});

      // Assert
      expect(presenter.presentInvalidSaveFile).toHaveBeenCalledWith(validationErrors, ['legacy-save-format']);
    });
  });
});
