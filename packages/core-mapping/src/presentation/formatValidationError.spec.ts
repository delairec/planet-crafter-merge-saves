import {describe, expect, it} from 'bun:test';
import {formatValidationError} from './formatValidationError';
import {VALIDATION_ISSUE_CODES} from '../application/ports/ValidationIssue';
import {SaveValidationMessageViewModel} from './viewModels/SaveFileValidationViewModel';

describe('formatValidationError', () => {

  describe('When the issue was found in a save entry', () => {
    it('should report the location alongside the message', () => {
      // Act
      const error = formatValidationError({
        code: VALIDATION_ISSUE_CODES.SCHEMA_VIOLATION,
        detail: 'must have required property gId',
        section: 2,
        entryIndex: 3
      });

      // Assert
      expect<SaveValidationMessageViewModel>(error).toEqual({message: 'must have required property gId', location: 'Players (section 2), entry 3'});
    });
  });

  describe('When the issue concerns the whole file', () => {
    it('should report the message without any location', () => {
      // Act
      const error = formatValidationError({
        code: VALIDATION_ISSUE_CODES.INVALID_EXTENSION,
        detail: 'Invalid file extension: expected a .json file.'
      });

      // Assert
      expect<SaveValidationMessageViewModel>(error).toEqual({message: 'Invalid file extension: expected a .json file.', location: null});
    });
  });

  describe('When the issue names a section but no entry', () => {
    it('should report the section alone', () => {
      // Act
      const error = formatValidationError({
        code: VALIDATION_ISSUE_CODES.INVALID_STRUCTURE,
        detail: 'Unexpected number of sections.',
        section: 0
      });

      // Assert
      expect<SaveValidationMessageViewModel>(error).toEqual({message: 'Unexpected number of sections.', location: 'Global metadata (section 0)'});
    });
  });
});
