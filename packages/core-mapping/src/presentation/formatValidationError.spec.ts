import {describe, expect, it} from 'bun:test';
import {formatValidationError} from './formatValidationError.ts';
import {VALIDATION_ISSUE_CODES} from '../application/ports/ValidationIssue.ts';

describe('formatValidationError', () => {

  describe('When the issue was found in a save entry', () => {
    it('should keep the section and the entry alongside the message', () => {
      // Act
      const error = formatValidationError({
        code: VALIDATION_ISSUE_CODES.SCHEMA_VIOLATION,
        detail: 'must have required property gId',
        section: 2,
        entryIndex: 3
      });

      // Assert
      expect(error).toEqual({message: 'must have required property gId', section: 2, entryIndex: 3});
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
      expect(error).toEqual({message: 'Invalid file extension: expected a .json file.'});
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
      expect(error).toEqual({message: 'Unexpected number of sections.', section: 0});
    });
  });
});
